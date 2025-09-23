import typia from "typia";
import type { Minimum } from "typia/lib/tags/Minimum";
import type { Type } from "typia/lib/tags/Type";

import api from "../../../../src/api";
import type { SuccessResponse } from "../../../../src/api/structures/SuccessResponse";

export const test_api_clubs_apply_cancelApplyClub = async (
  connection: api.IConnection,
) => {
  const output: SuccessResponse =
    await api.functional.clubs.apply.cancelApplyClub(
      connection,
      typia.random<number & Type<"int32"> & Minimum<1>>(),
    );
  typia.assert(output);
};
