import typia from "typia";

import api from "../../../../src/api";
import type { CloseRegistrationDto } from "../../../../src/api/structures/CloseRegistrationDto";
import type { RegistrationResponse } from "../../../../src/api/structures/RegistrationResponse";

export const test_api_admin_registration_close_closeRegistration = async (
  connection: api.IConnection,
) => {
  const output: RegistrationResponse =
    await api.functional.admin.registration.close.closeRegistration(
      connection,
      typia.random<CloseRegistrationDto>(),
    );
  typia.assert(output);
};
