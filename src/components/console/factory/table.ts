export type RowFunctionArgs<T = any, C = any> = {
  obj: T;
  columns: any[];
  customData?: C;
};
