import { SetMetadata } from '@nestjs/common';

export const BUSINESS_METRIC_KEY = 'business_metric';

export interface BusinessMetricOptions {
  operation: string;
  description?: string;
}

export const BusinessMetric = (options: BusinessMetricOptions) =>
  SetMetadata(BUSINESS_METRIC_KEY, options);
