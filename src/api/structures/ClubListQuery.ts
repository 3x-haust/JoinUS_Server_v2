import type { Maximum } from "typia/lib/tags/Maximum";
import type { Minimum } from "typia/lib/tags/Minimum";
import type { Type } from "typia/lib/tags/Type";

export type ClubListQuery = {
  page?: undefined | (number & Type<"int32"> & Minimum<1>);
  limit?: undefined | (number & Type<"int32"> & Minimum<1> & Maximum<100>);
  search?: undefined | string;
};
