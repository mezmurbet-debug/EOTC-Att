import { create } from "zustand";
import { getDatabase } from "../database/database";
import { Member } from "../types/Member";
import { generateMemberId } from "../utils/memberId";

type MemberStore = {
  members: Member[];
  loading: boolean;
  loadMembers: () => Promise<void>;
  addMember: (data: {
    fullName: string;
    phone: string;
    address: string;
    groupName: string;
  }) => Promise<Member>;
  deleteMember: (id: number) => Promise<void>;
};

export const useMemberStore = create<MemberStore>((set) => ({
  members: [],
  loading: false,

  loadMembers: async () => {
    set({ loading: true });

    const db = await getDatabase();

    const rows = await db.getAllAsync<Member>(
      "SELECT * FROM members ORDER BY full_name ASC"
    );

    set({
      members: rows,
      loading: false,
    });
  },

  addMember: async (data) => {
    const db = await getDatabase();

    const memberId = generateMemberId();
    const registrationDate = new Date().toISOString();

    await db.runAsync(
      `
      INSERT INTO members
      (
        member_id,
        full_name,
        phone,
        address,
        group_name,
        photo_uri,
        qr_code,
        registration_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      memberId,
      data.fullName,
      data.phone,
      data.address,
      data.groupName,
      null,
      memberId,
      registrationDate
    );

    const rows = await db.getAllAsync<Member>(
      "SELECT * FROM members WHERE member_id = ?",
      memberId
    );

    const member = rows[0];

    set((state) => ({
      members: [...state.members, member],
    }));

    return member;
  },

  deleteMember: async (id) => {
    const db = await getDatabase();

    await db.runAsync(
      "DELETE FROM members WHERE id = ?",
      id
    );

    set((state) => ({
      members: state.members.filter(
        (member) => member.id !== id
      ),
    }));
  },
}));
