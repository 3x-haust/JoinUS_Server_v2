import { Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
  makeSummaryProvider,
  PrometheusModule as CustomPrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { PrometheusService } from './prometheus.service';

@Module({
  imports: [
    CustomPrometheusModule.register({
      path: 'metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    PrometheusService,
    makeCounterProvider({
      name: 'feature_metric',
      help: 'This is a feature specific metric',
    }),
    makeGaugeProvider({
      name: 'memory_usage',
      help: 'Current memory usage',
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      buckets: [0.1, 0.5, 1, 2.5, 5, 10],
    }),
    makeSummaryProvider({
      name: 'http_request_summary',
      help: 'Summary of HTTP request durations',
      percentiles: [0.5, 0.9, 0.99],
    }),
  ],
  exports: [PrometheusService],
})
export class PrometheusModule {}
