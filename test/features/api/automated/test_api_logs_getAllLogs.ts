import typia from "typia";

import api from "../../../../src/api";
import type { GetAllLogsDto } from "../../../../src/api/structures/GetAllLogsDto";
import type { Log } from "../../../../src/api/structures/Log";

export const test_api_logs_getAllLogs = async (connection: api.IConnection) => {
  const output: Log.o1[] = await api.functional.logs.getAllLogs(
    connection,
    typia.random<GetAllLogsDto>(),
  );
  typia.assert(output);
};
