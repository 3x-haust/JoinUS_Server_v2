import type { Club } from "./Club";
import type { Log } from "./Log";

export type User = {
  id: number;
  email: string;
  role: "admin" | "teacher" | "student";
  name: string;
  grade: number;
  oauthProvider: string;
  oauthProviderId: string;
  refreshToken: string;
  teachingClubs: Club[];
  joinedClubs: Club[];
  bookmarkedClubs: Club[];
  logs: Log[];
};
export namespace User {
  export type o1 = {
    id: number;
    email: string;
    role: "admin" | "teacher" | "student";
    name: string;
    grade: number;
    oauthProvider: string;
    oauthProviderId: string;
    refreshToken: string;
    teachingClubs: Club.o1[];
    joinedClubs: Club.o1[];
    bookmarkedClubs: Club.o1[];
    logs: Log.o1[];
  };
  export type o2 = {
    id: number;
    email: string;
    role: "admin" | "teacher" | "student";
    name: string;
    grade: number;
    oauthProvider: string;
    oauthProviderId: string;
    refreshToken: string;
    teachingClubs: Club.o2[];
    joinedClubs: Club.o2[];
    bookmarkedClubs: Club.o2[];
    logs: Log.o2[];
  };
}
