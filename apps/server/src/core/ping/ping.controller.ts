import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PingResponseDto } from '../../common';
import { PingService } from './ping.service';

@ApiTags('Health & Monitoring')
@Controller('ping')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check / Ping',
    description: 'Returns server health status and current timestamp.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Server is healthy and responsive.',
    type: PingResponseDto,
  })
  ping(): PingResponseDto {
    return this.pingService.ping();
  }
}
