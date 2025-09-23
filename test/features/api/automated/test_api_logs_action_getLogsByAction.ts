import typia from "typia";

import api from "../../../../src/api";
import type { Log } from "../../../../src/api/structures/Log";
import type { PaginationDto } from "../../../../src/api/structures/PaginationDto";

export const test_api_logs_action_getLogsByAction = async (
  connection: api.IConnection,
) => {
  const output: Log.o1[] = await api.functional.logs.action.getLogsByAction(
    connection,
    typia.random<
      | "APPLY"
      | "CANCEL_APPLY"
      | "BOOKMARK"
      | "UNBOOKMARK"
      | "VIEW_CLUB_LIST"
      | "VIEW_CLUB_DETAIL"
      | "VIEW_MY_PAGE"
      | "CREATE_CLUB"
      | "UPDATE_CLUB"
      | "DELETE_CLUB"
      | "VIEW_APPLICANTS"
      | "EXPORT_APPLICANTS"
      | "VIEW_TEACHER_PAGE"
      | "IMPORT_USERS_CSV"
      | "IMPORT_CLUBS_CSV"
      | "AUTO_CLOSE_CLUB"
      | "AUTO_OPEN_CLUB"
      | "LOGIN"
      | "LOGOUT"
      | "REGISTER"
    >(),
    typia.random<PaginationDto>(),
  );
  typia.assert(output);
};
