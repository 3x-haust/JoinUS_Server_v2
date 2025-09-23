import typia from "typia";

import api from "../../../../src/api";

export const test_api_health_metrics_getMetrics = async (
  connection: api.IConnection,
) => {
  const output: {
    status: string;
    endpoint: string;
  } = await api.functional.health.metrics.getMetrics(connection);
  typia.assert(output);
};
