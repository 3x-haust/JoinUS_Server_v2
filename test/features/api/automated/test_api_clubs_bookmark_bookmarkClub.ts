import typia from "typia";

import api from "../../../../src/api";
import type { BookmarkClubDto } from "../../../../src/api/structures/BookmarkClubDto";
import type { SuccessResponse } from "../../../../src/api/structures/SuccessResponse";

export const test_api_clubs_bookmark_bookmarkClub = async (
  connection: api.IConnection,
) => {
  const output: SuccessResponse =
    await api.functional.clubs.bookmark.bookmarkClub(
      connection,
      typia.random<BookmarkClubDto>(),
    );
  typia.assert(output);
};
