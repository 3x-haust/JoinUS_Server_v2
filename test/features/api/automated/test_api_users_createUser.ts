import typia from "typia";

import api from "../../../../src/api";
import type { CreateUserDto } from "../../../../src/api/structures/CreateUserDto";
import type { User } from "../../../../src/api/structures/User";

export const test_api_users_createUser = async (
  connection: api.IConnection,
) => {
  const output: User.o2 = await api.functional.users.createUser(
    connection,
    typia.random<CreateUserDto>(),
  );
  typia.assert(output);
};
