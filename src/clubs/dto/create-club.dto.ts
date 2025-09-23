import { tags } from 'typia';

export interface CreateClubDto {
  teacherId: number & tags.Type<'int32'>;
  name: string;
  url?: string;
  preview?: string;
  description: string;
  capacity: (number & tags.Type<'int32'>)[];
}
