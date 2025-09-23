import type { Format } from "typia/lib/tags/Format";

import type { User } from "./User";

export type Log = {
  id: number;
  userId: number;
  action:
    | "APPLY"
    | "CANCEL_APPLY"
    | "BOOKMARK"
    | "UNBOOKMARK"
    | "VIEW_CLUB_LIST"
    | "VIEW_CLUB_DETAIL"
    | "VIEW_MY_PAGE"
    | "CREATE_CLUB"
    | "UPDATE_CLUB"
    | "DELETE_CLUB"
    | "VIEW_APPLICANTS"
    | "EXPORT_APPLICANTS"
    | "VIEW_TEACHER_PAGE"
    | "IMPORT_USERS_CSV"
    | "IMPORT_CLUBS_CSV"
    | "AUTO_CLOSE_CLUB"
    | "AUTO_OPEN_CLUB"
    | "LOGIN"
    | "LOGOUT"
    | "REGISTER";
  targetType: "CLUB" | "USER" | "SYSTEM" | "PAGE" | "FILE" | "AUTH";
  targetId: number;
  description: string;
  createdAt: string & Format<"date-time">;
  user: User;
};
export namespace Log {
  export type o1 = {
    id: number;
    userId: number;
    action:
      | "APPLY"
      | "CANCEL_APPLY"
      | "BOOKMARK"
      | "UNBOOKMARK"
      | "VIEW_CLUB_LIST"
      | "VIEW_CLUB_DETAIL"
      | "VIEW_MY_PAGE"
      | "CREATE_CLUB"
      | "UPDATE_CLUB"
      | "DELETE_CLUB"
      | "VIEW_APPLICANTS"
      | "EXPORT_APPLICANTS"
      | "VIEW_TEACHER_PAGE"
      | "IMPORT_USERS_CSV"
      | "IMPORT_CLUBS_CSV"
      | "AUTO_CLOSE_CLUB"
      | "AUTO_OPEN_CLUB"
      | "LOGIN"
      | "LOGOUT"
      | "REGISTER";
    targetType: "CLUB" | "USER" | "SYSTEM" | "PAGE" | "FILE" | "AUTH";
    targetId: number;
    description: string;
    createdAt: string & Format<"date-time">;
    user: User.o1;
  };
  export type o2 = {
    id: number;
    userId: number;
    action:
      | "APPLY"
      | "CANCEL_APPLY"
      | "BOOKMARK"
      | "UNBOOKMARK"
      | "VIEW_CLUB_LIST"
      | "VIEW_CLUB_DETAIL"
      | "VIEW_MY_PAGE"
      | "CREATE_CLUB"
      | "UPDATE_CLUB"
      | "DELETE_CLUB"
      | "VIEW_APPLICANTS"
      | "EXPORT_APPLICANTS"
      | "VIEW_TEACHER_PAGE"
      | "IMPORT_USERS_CSV"
      | "IMPORT_CLUBS_CSV"
      | "AUTO_CLOSE_CLUB"
      | "AUTO_OPEN_CLUB"
      | "LOGIN"
      | "LOGOUT"
      | "REGISTER";
    targetType: "CLUB" | "USER" | "SYSTEM" | "PAGE" | "FILE" | "AUTH";
    targetId: number;
    description: string;
    createdAt: string & Format<"date-time">;
    user: User.o2;
  };
}
