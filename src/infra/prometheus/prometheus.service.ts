import { Injectable } from '@nestjs/common';
import { Counter, register } from 'prom-client';

interface MetricLabels {
  controller: string;
  handler: string;
  method: string;
}

@Injectable()
export class PrometheusService {
  private successCounter: Counter<string>;
  private failureCounter: Counter<string>;

  constructor() {
    this.successCounter = new Counter({
      name: 'nestjs_requests_success_total',
      help: 'Total number of successful requests',
      labelNames: ['controller', 'handler', 'method'],
      registers: [register],
    });

    this.failureCounter = new Counter({
      name: 'nestjs_requests_failure_total',
      help: 'Total number of failed requests',
      labelNames: ['controller', 'handler', 'method'],
      registers: [register],
    });
  }

  incrementSuccessCounter(labels: MetricLabels): void {
    this.successCounter
      .labels(labels.controller, labels.handler, labels.method)
      .inc();
  }

  incrementFailureCounter(labels: MetricLabels): void {
    this.failureCounter
      .labels(labels.controller, labels.handler, labels.method)
      .inc();
  }

  resetMetrics(): void {
    register.resetMetrics();
  }
}
