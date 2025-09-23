export type CreateUserDto = {
  email: string;
  name: string;
  role: "admin" | "teacher" | "student";
  grade: number;
};
