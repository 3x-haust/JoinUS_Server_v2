import type { Format } from "typia/lib/tags/Format";

import type { User } from "./User";

export type Club = {
  id: number;
  teacherId: number;
  teacher: User;
  name: string;
  url: string;
  preview: string;
  description: string;
  capacity: number[];
  startDate: string & Format<"date-time">;
  endDate: string & Format<"date-time">;
  isApplicationOpen: boolean;
  currentApplicantCount: number;
  version: number;
  applicants: User[];
  bookmarkedBy: User[];
};
export namespace Club {
  export type o1 = {
    id: number;
    teacherId: number;
    teacher: User.o1;
    name: string;
    url: string;
    preview: string;
    description: string;
    capacity: number[];
    startDate: string & Format<"date-time">;
    endDate: string & Format<"date-time">;
    isApplicationOpen: boolean;
    currentApplicantCount: number;
    version: number;
    applicants: User.o1[];
    bookmarkedBy: User.o1[];
  };
  export type o2 = {
    id: number;
    teacherId: number;
    teacher: User.o2;
    name: string;
    url: string;
    preview: string;
    description: string;
    capacity: number[];
    startDate: string & Format<"date-time">;
    endDate: string & Format<"date-time">;
    isApplicationOpen: boolean;
    currentApplicantCount: number;
    version: number;
    applicants: User.o2[];
    bookmarkedBy: User.o2[];
  };
}
