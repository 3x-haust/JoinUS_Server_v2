export class CancelApplyClubCommand {
  constructor(
    public readonly clubId: number,
    public readonly userId: number,
  ) {}
}
