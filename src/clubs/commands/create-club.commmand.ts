export class CreateClubCommand {
  constructor(
    public readonly teacherId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly capacity: number[],
    public readonly url?: string,
    public readonly preview?: string,
  ) {}
}
