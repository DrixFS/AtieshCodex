import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PingResponseDto {
  @ApiProperty({
    type: String,
    description: 'Status message indicating API responsiveness',
    example: 'pong',
  })
  message: string;

  @ApiProperty({
    type: String,
    description: 'ISO-8601 timestamp of when the ping was processed',
    example: '2026-09-15T12:00:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Correlation ID assigned to the request trace',
    example: 'd9b2d63d-a233-4123-8478-f3d919712001',
  })
  correlationId?: string;
}

export type PingResponse = PingResponseDto;
