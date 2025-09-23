import typia from "typia";

import api from "../../../../src/api";
import type { Club } from "../../../../src/api/structures/Club";
import type { ClubListQuery } from "../../../../src/api/structures/ClubListQuery";

export const test_api_clubs_getClubList = async (
  connection: api.IConnection,
) => {
  const output: Club[] = await api.functional.clubs.getClubList(
    connection,
    typia.random<ClubListQuery>(),
  );
  typia.assert(output);
};
