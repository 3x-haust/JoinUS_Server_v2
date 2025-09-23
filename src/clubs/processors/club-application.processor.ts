import { Injectable } from '@nestjs/common';
import { ClubApplicationQueueService } from '../services/club-application-queue.service';

@Injectable()
export class ClubApplicationProcessor {
  constructor(private readonly queueService: ClubApplicationQueueService) {}

  async processClubApplication(data: {
    userId: number;
    clubId: number;
    requestId: string;
  }): Promise<void> {
    const event = {
      ...data,
      timestamp: Date.now(),
    };

    await this.queueService.processApplication(event);
  }
}
