import typia from "typia";

import api from "../../../../src/api";
import type { User } from "../../../../src/api/structures/User";

export const test_api_users_me_getMyPage = async (
  connection: api.IConnection,
) => {
  const output: User.o2 = await api.functional.users.me.getMyPage(connection);
  typia.assert(output);
};
