import typia from "typia";

import api from "../../../../src/api";
import type { Club } from "../../../../src/api/structures/Club";

export const test_api_clubs_me_bookmarked_getBookmarkedClubs = async (
  connection: api.IConnection,
) => {
  const output: Club[] =
    await api.functional.clubs.me.bookmarked.getBookmarkedClubs(connection);
  typia.assert(output);
};
