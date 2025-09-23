import type { Type } from "typia/lib/tags/Type";

export type CreateClubDto = {
  teacherId: number & Type<"int32">;
  name: string;
  url?: undefined | string;
  preview?: undefined | string;
  description: string;
  capacity: (number & Type<"int32">)[];
};
