export const CACHE_TTL = {
  SHORT: 120,
  MEDIUM: 300,
  LONG: 600,
  USER_DETAIL: 600,
  CLUB_DETAIL: 600,
  USER_LIST: 300,
  CLUB_LIST: 300,
  LOGS: 180,
  ADMIN_DATA: 300,
} as const;

export const CACHE_KEYS = {
  USER: {
    DETAIL: (id: number) => `user:detail:${id}`,
    MY_PAGE: (id: number) => `user:mypage:${id}`,
    BOOKMARKED_CLUBS: (id: number) => `user:${id}:bookmarked-clubs`,
    APPLIED_CLUBS: (id: number) => `user:${id}:applied-clubs`,
    BY_EMAIL: (email: string) => `user:email:${email}`,
    BY_ID: (id: number) => `user:id:${id}`,
    ALL: 'users:all',
  },
  CLUB: {
    DETAIL: (id: number) => `club:detail:${id}`,
    LIST: 'clubs:list',
    LIST_WITH_PARAMS: (page: number, limit: number, search?: string) =>
      `clubs:list:${page}:${limit}:${search || 'all'}`,
  },
  ADMIN: {
    USERS: 'admin:users:all',
    TEACHERS: 'admin:teachers:all',
    STUDENTS: 'admin:students:all',
    CLUBS: 'admin:clubs:all',
    LOGS: 'admin:logs:all',
  },
  LOGS: {
    ALL: 'logs:all',
    BY_USER: (userId: number) => `logs:user:${userId}`,
    RECENT: (limit: number) => `logs:recent:${limit}`,
  },
} as const;
