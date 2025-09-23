import typia from "typia";

import api from "../../../../src/api";
import type { RegistrationResponse } from "../../../../src/api/structures/RegistrationResponse";
import type { SetRegistrationPeriodDto } from "../../../../src/api/structures/SetRegistrationPeriodDto";

export const test_api_admin_registration_open_openRegistration = async (
  connection: api.IConnection,
) => {
  const output: RegistrationResponse =
    await api.functional.admin.registration.open.openRegistration(
      connection,
      typia.random<SetRegistrationPeriodDto>(),
    );
  typia.assert(output);
};
