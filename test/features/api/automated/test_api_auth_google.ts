import typia from "typia";

import api from "../../../../src/api";
import type { LoginDto } from "../../../../src/api/structures/LoginDto";

export const test_api_auth_google = async (connection: api.IConnection) => {
  const output:
    | {
        success: boolean;
        token: string;
      }
    | {
        success: boolean;
        token?: undefined;
      } = await api.functional.auth.google(
    connection,
    typia.random<LoginDto>(),
  );
  typia.assert(output);
};
