import typia from "typia";

import api from "../../../../src/api";
import type { Club } from "../../../../src/api/structures/Club";
import type { CreateClubDto } from "../../../../src/api/structures/CreateClubDto";

export const test_api_clubs_createClub = async (
  connection: api.IConnection,
) => {
  const output: Club = await api.functional.clubs.createClub(
    connection,
    typia.random<CreateClubDto>(),
  );
  typia.assert(output);
};
