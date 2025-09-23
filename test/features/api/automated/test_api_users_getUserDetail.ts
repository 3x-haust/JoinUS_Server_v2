import typia from "typia";
import type { Minimum } from "typia/lib/tags/Minimum";
import type { Type } from "typia/lib/tags/Type";

import api from "../../../../src/api";
import type { User } from "../../../../src/api/structures/User";

export const test_api_users_getUserDetail = async (
  connection: api.IConnection,
) => {
  const output: User.o2 = await api.functional.users.getUserDetail(
    connection,
    typia.random<number & Type<"int32"> & Minimum<1>>(),
  );
  typia.assert(output);
};
