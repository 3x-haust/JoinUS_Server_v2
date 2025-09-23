export class ApplyClubCommand {
  constructor(
    public readonly clubId: number,
    public readonly userId: number,
  ) {}
}
