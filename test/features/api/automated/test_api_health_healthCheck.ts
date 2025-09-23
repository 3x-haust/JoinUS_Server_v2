import typia from "typia";

import api from "../../../../src/api";

export const test_api_health_healthCheck = async (
  connection: api.IConnection,
) => {
  const output: {} = await api.functional.health.healthCheck(connection);
  typia.assert(output);
};
