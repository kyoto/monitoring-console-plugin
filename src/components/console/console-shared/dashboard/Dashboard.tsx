import * as React from 'react';
import classNames from 'classnames';
import { OverviewProps } from '@openshift-console/dynamic-plugin-sdk';
import './dashboard.scss';

const Dashboard: React.FC<OverviewProps> = ({ className, children }) => (
  <div data-test-id="dashboard" className={classNames('co-dashboard-body', className)}>
    {children}
  </div>
);

export default Dashboard;
