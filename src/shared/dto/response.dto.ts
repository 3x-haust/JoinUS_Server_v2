import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ example: 200 })
  @ApiProperty({ description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty()
  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty()
  data: T;
}
