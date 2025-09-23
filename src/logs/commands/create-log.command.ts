export class CreateLogCommand {
  constructor(
    public readonly userId: number,
    public readonly action: string,
    public readonly targetType: string,
    public readonly targetId?: number,
    public readonly description?: string,
  ) {}
}
