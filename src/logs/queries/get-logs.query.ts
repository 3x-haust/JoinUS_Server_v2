export class GetLogsByUserQuery {
  constructor(
    public readonly userId: number,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

export class GetLogsByClubQuery {
  constructor(
    public readonly clubId: number,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

export class GetLogsByActionQuery {
  constructor(
    public readonly action: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

export class GetAllLogsQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
