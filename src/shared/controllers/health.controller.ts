import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from '../../infra/prometheus/prometheus.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prometheusService: PrometheusService) {}

  /**
   * 애플리케이션 헬스 체크 엔드포인트
   * 서버의 현재 상태, 가동 시간, 메모리 사용량 등의 기본 정보를 반환합니다.
   *
   * @tag Prometheus
   *
   * @returns {Object} 헬스 체크 결과 객체
   * @property {string} status - 서버 상태 ('ok')
   * @property {string} timestamp - 현재 시간 ISO 문자열
   * @property {number} uptime - 서버 가동 시간 (초)
   * @property {NodeJS.MemoryUsage} memory - 메모리 사용량 정보
   */
  @Get()
  healthCheck(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
