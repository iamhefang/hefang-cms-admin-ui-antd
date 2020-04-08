import React from 'react';
import ProTable, { ProColumns, ProTableProps } from '@ant-design/pro-table';
import EditableCell from '@/components/EditableProTable/EditableCell';
import EditableRow from '@/components/EditableProTable/EditableRow';
import memoizeOne from 'memoize-one';

export interface EditableProTableProps<T, P> extends Omit<ProTableProps<T, P>, 'columns'> {
  columns: EditableProTableColumn<T>[];

  onEditSubmit?(values: Partial<T>, record?: T): void;
}

interface EditableProTableState<T> {}

// export interface EditableProTableColumn<T> extends ProColumns<T> {
//   editable?: boolean;
//   editType?: 'text' | 'mail' | 'number' | 'textarea' | 'date' | 'datetime' | 'password';
// }

export type EditableProTableColumn<T> = ProColumns<T> & {
  editable?: boolean;
  editType?: 'text' | 'mail' | 'number' | 'textarea' | 'date' | 'datetime' | 'password';
};

export default class EditableProTable<
  T,
  P extends { [key: string]: any } = {}
> extends React.Component<EditableProTableProps<T, P>, EditableProTableState<T>> {
  private makeColumns = memoizeOne((columns: EditableProTableColumn<T>[]): EditableProTableColumn<
    T
  >[] =>
    // @ts-ignore
    columns.map(col => ({
      ...col,
      onCell: (record: any, index?: number) => ({
        record,
        index,
        dataIndex: col.dataIndex,
        title: col.title,
        editable: col.editable,
        editType: col.editType,
        onSubmit: this.props.onEditSubmit,
      }),
    })),
  );

  constructor(props: EditableProTableProps<T, P>) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ProTable<T, P>
        {...this.props}
        columns={this.makeColumns(this.props.columns)}
        components={{
          body: {
            cell: EditableCell,
            row: EditableRow,
          },
        }}
      />
    );
  }
}
