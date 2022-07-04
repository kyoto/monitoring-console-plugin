import * as _ from 'lodash-es';
import * as React from 'react';

import { Bar } from '../console/graphs/bar';

const Label = ({ metric }) => <>{_.values(metric).join()}</>;

const BarChart: React.FC<BarChartProps> = ({ pollInterval, query }) => (
  <Bar
    barSpacing={5}
    barWidth={8}
    delay={pollInterval}
    // @ts-ignore TODO
    LabelComponent={Label}
    query={query}
  />
);

type BarChartProps = {
  pollInterval: number;
  query: string;
};
export default BarChart;
