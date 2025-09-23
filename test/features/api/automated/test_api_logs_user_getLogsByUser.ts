import typia from "typia";

import api from "../../../../src/api";
import type { Log } from "../../../../src/api/structures/Log";
import type { PaginationDto } from "../../../../src/api/structures/PaginationDto";

export const test_api_logs_user_getLogsByUser = async (
  connection: api.IConnection,
) => {
  const output: Log.o1[] = await api.functional.logs.user.getLogsByUser(
    connection,
    typia.random<number>(),
    typia.random<PaginationDto>(),
  );
  typia.assert(output);
};
