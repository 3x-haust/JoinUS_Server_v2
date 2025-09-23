export class GetClubDetailQuery {
  constructor(
    public readonly clubId: number,
    public readonly userId?: number,
  ) {}
}
