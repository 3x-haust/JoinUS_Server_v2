import typia from "typia";
import type { Minimum } from "typia/lib/tags/Minimum";
import type { Type } from "typia/lib/tags/Type";

import api from "../../../../src/api";
import type { Club } from "../../../../src/api/structures/Club";

export const test_api_clubs_getClubDetail = async (
  connection: api.IConnection,
) => {
  const output: Club = await api.functional.clubs.getClubDetail(
    connection,
    typia.random<number & Type<"int32"> & Minimum<1>>(),
  );
  typia.assert(output);
};
