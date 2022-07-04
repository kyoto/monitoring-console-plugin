import {
  Alert,
  PrometheusLabels,
  PrometheusRule,
  RowFilter,
  Rule,
  Silence,
} from '@openshift-console/dynamic-plugin-sdk';

import { ObserveState } from '../reducers/observe';

import { RowFunctionArgs } from './console/factory/table';

export const enum AlertSource {
  Platform = 'platform',
  User = 'user',
}

export type MonitoringResource = {
  abbr: string;
  kind: string;
  label: string;
  plural: string;
};

export type Silences = {
  data: Silence[];
  loaded: boolean;
  loadError?: string | Error;
};

export type Alerts = {
  data: Alert[];
  loaded: boolean;
  loadError?: string | Error;
};

export type Rules = {
  data: Rule[];
  loaded: boolean;
  loadError?: string | Error;
};

type Group = {
  rules: PrometheusRule[];
  file: string;
  name: string;
};

export type PrometheusAPIError = {
  response: {
    status: number;
  };
  json: {
    error?: string;
  };
  message?: string;
};

export type PrometheusRulesResponse = {
  data: {
    groups: Group[];
  };
  status: string;
};

export type ListPageProps = {
  CreateButton?: React.ComponentType<{}>;
  data: Alert[] | Rule[] | Silence[];
  defaultSortField: string;
  Header: (...args) => any[];
  hideLabelFilter?: boolean;
  kindPlural: string;
  labelFilter?: string;
  labelPath?: string;
  loaded: boolean;
  loadError?: any;
  nameFilterID: string;
  reduxID: string;
  Row: React.FC<RowFunctionArgs>;
  rowFilters: RowFilter[];
  showTitle?: boolean;
  TopAlert?: React.ReactNode
};

export type Target = {
  discoveredLabels: PrometheusLabels;
  globalUrl: string;
  health: 'up' | 'down';
  labels: PrometheusLabels;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  scrapePool: string;
  scrapeUrl: string;
};

export type RootState = {
  observe: ObserveState;
};
