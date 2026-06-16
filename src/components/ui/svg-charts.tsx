/**
 * @module svg-charts
 * @description Re-export barrel for chart components.
 * Individual chart implementations live in ./charts/ subdirectory.
 */
export { AreaChart } from './charts/area-chart';
export { BarChart } from './charts/bar-chart';
export { DonutChart } from './charts/donut-chart';

// Re-export shared types
export type { ChartDataItem } from './charts/area-chart';
export type { DonutDataItem } from './charts/donut-chart';
