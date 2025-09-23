import typia from "typia";

import api from "../../../../src/api";
import type { Club } from "../../../../src/api/structures/Club";

export const test_api_clubs_me_applied_getMyAppliedClubs = async (
  connection: api.IConnection,
) => {
  const output: Club[] =
    await api.functional.clubs.me.applied.getMyAppliedClubs(connection);
  typia.assert(output);
};
