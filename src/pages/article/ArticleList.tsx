import React, { useEffect, useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Article, ArticleState, Category } from '@/models/article';
import { connect } from 'dva';
import ProTable, {
  ActionType,
  ColumnsState,
  IntlType,
  ProColumns,
  RequestData,
} from '@ant-design/pro-table';
import { ConnectProps, ConnectState } from '@/models/connect';
import { Button, Divider, Dropdown, Menu, Modal, Popconfirm, Tag } from 'antd';
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  RestOutlined,
  SubnodeOutlined,
} from '@ant-design/icons/lib';
import { deleteArticles, queryArticles } from '@/services/article';
import { DeleteEnum, RestPagerResult } from '@/utils/request';
import { Key, SorterResult } from 'antd/es/table/interface';
import { PaginationConfig } from 'antd/es/pagination';
import { chainingCheck, execute } from 'hefang-js';
import { Account } from '@/models/login';
import { Link } from 'umi';
import _ from 'lodash';
import { UseFetchDataAction } from '@ant-design/pro-table/lib/useFetchData';

type ArticleListProps = ConnectProps & ArticleState & { login?: Account };

export interface ArticleListInnerState {
  title?: string | null;
  postTime?: string[];
  categoryName?: string | null;
  categoryId?: string[] | null;
  sort?: string | null;
  type?: string;
}

const SORTER_MAP = {
  descend: '-',
  ascend: '+',
};

function showArticlePreviewModal(article: Article) {
  Modal.info({
    icon: <FileTextOutlined />,
    title: article.title,
    width: 850,
    okText: '关闭',
    maskClosable: true,
    centered: true,
    content: (
      <div
        dangerouslySetInnerHTML={{ __html: article?.content || '' }}
        style={{ height: '100%', overflow: 'auto', maxHeight: window.innerHeight * 0.7 }}
      />
    ),
  });
}

function doRequest(
  params?: { pageSize?: number; current?: number } & ArticleListInnerState,
): Promise<RequestData<Article>> {
  const { pageSize = 10, current = 1, sort = '', title, postTime, categoryId, type } = params || {};
  const query: string[] = [];
  if (title) {
    query.push(`title~=${title}`);
  }
  if (postTime?.length) {
    query.push(
      `(post_time>=${postTime[0].split(' ')[0]} 00:00:00&post_time<=${
        postTime[1].split(' ')[0]
      } 23:59:59)`,
    );
  }
  if (categoryId?.length) {
    query.push(`(${categoryId.map(id => `categoryId=${id}`).join(' OR ')})`);
  }
  if (type) {
    query.push(`type=${type}`);
  }

  return new Promise((resolve, reject) => {
    queryArticles({
      sort,
      pageSize,
      pageIndex: current,
      query: query.join('&'),
    })
      .then((res: RestPagerResult<Article>) => {
        resolve({
          data: res.result.data,
          success: true,
          total: res.result.total,
        });
      })
      .catch(reject);
  });
}

function handleCategoriesSearch(categories: Category[]) {
  const valueEnum = {};
  categories.forEach(item => {
    valueEnum[item.id] = item.name;
  });
  return valueEnum;
}

function handleCategoriesFilters(categories: Category[]) {
  return categories.map(item => ({
    text: item.name,
    value: item.id,
  }));
}

function renderTableAlert({
  selectedRowKeys = [],
  selectedRows = [],
}: {
  intl: IntlType;
  selectedRowKeys: (string | number)[];
  selectedRows: Article[];
}) {
  return (
    <div>
      已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
      <span>
        总阅读量: {selectedRows.reduce((pv, cv) => pv + (cv?.readCount as number), 0)}&nbsp;&nbsp;
        总点赞量: {selectedRows.reduce((pv, cv) => pv + (cv?.opposeCount as number), 0)}
      </span>
    </div>
  );
}

function renderPageTotal(total: number) {
  return `共${total}条`;
}

function renderDropdownMenu(
  selectedRowKeys: string[],
  selectedRows: Article[],
  action: UseFetchDataAction<RequestData<Article>>,
) {
  const selectedMap = {
    [DeleteEnum.DESTROY]: selectedRowKeys,
    [DeleteEnum.RESTORE]: selectedRows.filter(item => !item.enable).map(item => item.id),
    [DeleteEnum.RECYCLE]: selectedRows.filter(item => item.enable).map(item => item.id),
  };
  return (
    <Menu
      onClick={({ key }) => {
        const messageMap = {
          [DeleteEnum.DESTROY]: '删除后不可恢复, 确定要彻底删除吗?',
          [DeleteEnum.RESTORE]: '还原后会自动放入草稿箱中, 确定要还原吗?',
          [DeleteEnum.RECYCLE]: '确定要放入回收站吗?',
        };
        Modal.confirm({
          icon: <QuestionCircleOutlined />,
          title: '确定要执行操作吗?',
          content: `请选中了${selectedRows.length}条数据, ${messageMap[key]}`,
          onOk: () => {
            deleteArticles(selectedRowKeys as string[], key as DeleteEnum).finally(() => {
              action.reload();
            });
          },
        });
      }}
      selectedKeys={[]}
    >
      {selectedMap[DeleteEnum.RECYCLE].length ? (
        <Menu.Item key={DeleteEnum.RECYCLE}>
          <DeleteOutlined /> 放入回收站({selectedMap[DeleteEnum.RECYCLE].length})
        </Menu.Item>
      ) : null}
      <Menu.Item key={DeleteEnum.DESTROY}>
        <RestOutlined /> 彻底删除({selectedRowKeys?.length})
      </Menu.Item>
      {selectedMap[DeleteEnum.RESTORE].length ? (
        <Menu.Item key={DeleteEnum.RESTORE}>
          <HistoryOutlined />
          还原({selectedMap[DeleteEnum.RESTORE].length})
        </Menu.Item>
      ) : null}
    </Menu>
  );
}

const fixedState: { [key: string]: ColumnsState } = {
  number: { show: true },
  title: { show: true },
};
const typeMap = {
  article: '文章',
  page: '页面',
};

function ArticleList(props: ArticleListProps) {
  const { categories = [], data, dispatch, login } = props;
  useEffect(() => {
    execute(dispatch, {
      type: 'article/fetchCategoriesAndTags',
    });
  }, [categories.length]);
  const refAction = useRef<ActionType>();
  const [state, setState] = useState<ArticleListInnerState>({});
  const [columnState, setColState] = useState<{ [key: string]: ColumnsState }>(
    _.merge(
      {
        categoryId: { show: window.innerWidth > 1600 },
        tags: { show: window.innerWidth > 1600 },
      },
      fixedState,
    ),
  );
  const columns: ProColumns<Article>[] = [
    {
      title: '编号',
      width: 75,
      key: 'number',
      align: 'center',
      renderText: (text: any, record: Article, index: number) => `${index + 1}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 80,
      renderText: text => chainingCheck(typeMap, text) || text,
      valueEnum: typeMap,
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (text: React.ReactNode, record: Article) => (
        <Button
          type="link"
          style={{ paddingLeft: 0 }}
          onClick={() => showArticlePreviewModal(record)}
        >
          {text}
        </Button>
      ),
      valueType: 'text',
      formItemProps: {
        placeholder: '请输入标题',
        allowClear: true,
      },
      fixed: true,
    },
    {
      title: '分类',
      sorter: true,
      width: 150,
      dataIndex: 'categoryId',
      render: (text, record: Article) => (
        <a
          onClick={() =>
            setState({
              categoryId: [record.categoryId as string],
              categoryName: record.categoryName,
            })
          }
        >
          {record.categoryName}
        </a>
      ),
      initialValue: state.categoryName,
      valueEnum: handleCategoriesSearch(categories),
      filters: handleCategoriesFilters(categories),
      formItemProps: {
        placeholder: '请选择分类',
        allowClear: true,
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      hideInSearch: true,
      render: (__, record: Article) =>
        record?.tags?.length ? record.tags.map(tag => <Tag>{tag}</Tag>) : '无标签',
    },
    {
      title: '阅读',
      width: 80,
      align: 'center',
      sorter: true,
      dataIndex: 'readCount',
      hideInSearch: true,
    },
    {
      title: '点赞',
      width: 80,
      align: 'center',
      sorter: true,
      dataIndex: 'approvalCount',
      hideInSearch: true,
    },
    {
      title: '发表时间',
      width: 120,
      align: 'center',
      sorter: true,
      dataIndex: 'postTime',
      valueType: 'dateRange',
    },
    {
      title: '草稿',
      width: 100,
      sorter: true,
      dataIndex: 'isDraft',
      align: 'center',
      hideInSearch: true,
      render: text =>
        text ? <Tag color="processing">草稿</Tag> : <Tag color="success">已发表</Tag>,
      filters: [
        { text: '草稿', value: '1' },
        { text: '已发表', value: '0' },
      ],
    },
  ];

  if (login?.isAdmin) {
    columns.push({
      title: '回收站',
      width: 120,
      sorter: true,
      dataIndex: 'enable',
      align: 'center',
      hideInSearch: true,
      render: text => (text ? <Tag color="success">正常</Tag> : <Tag color="error">已回收</Tag>),
      filters: [
        { text: '正常', value: '1' },
        { text: '已删除', value: '0' },
      ],
    });
  }
  columns.push({
    title: '操作',
    width: 120,
    align: 'center',
    render: (__, record: Article) => (
      <>
        {record.enable ? (
          <Popconfirm
            title="确定要删除该文章吗?"
            placement="leftBottom"
            onConfirm={() => {
              deleteArticles([record.id as string]).finally(() => refAction?.current?.reload());
            }}
          >
            <Button type="link" danger title="删除" icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : (
          <Popconfirm title="确定要还原该文章吗?">
            <Button type="link" icon={<SubnodeOutlined />} />
          </Popconfirm>
        )}
        <Divider type="vertical" />
        <Link to={`/content/articles/editor/${record.id}.html`}>
          <Button type="link" icon={<EditOutlined />} title="编辑" />
        </Link>
      </>
    ),
  });
  return (
    <PageHeaderWrapper title="文章列表">
      <ProTable<Article>
        headerTitle="文章列表"
        columns={columns}
        dataSource={data}
        columnsStateMap={columnState}
        onColumnsStateChange={newState => setColState(_.merge(newState, fixedState))}
        onSubmit={(values: ArticleListInnerState) => {
          setState({
            title: '',
            postTime: [],
            categoryName: '',
            categoryId: [],
            type: '',
            ...values,
          });
        }}
        rowKey="id"
        actionRef={refAction}
        params={state}
        onChange={(
          __: PaginationConfig,
          filters: Record<string, Key[] | null>,
          sorter: SorterResult<Article> | SorterResult<Article>[],
        ) => {
          const realSorter: SorterResult<Article>[] = Array.isArray(sorter) ? sorter : [sorter];
          if (_.isEmpty(sorter) || _.isEmpty(realSorter)) {
            return;
          }
          setState({
            sort: realSorter
              .map(item => `${chainingCheck(SORTER_MAP, item?.order as string) || ''}${item.field}`)
              .join(','),
            categoryId: filters?.categoryId as string[],
          });
        }}
        toolBarRender={(
          action: UseFetchDataAction<RequestData<Article>>,
          { selectedRowKeys, selectedRows },
        ) => [
          <Link to="/content/articles/editor.html">
            <Button type="primary">
              <PlusOutlined /> 新建
            </Button>
          </Link>,
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={() => renderDropdownMenu(selectedRowKeys as string[], selectedRows, action)}
            >
              <Button type="danger">
                批量删除 <DownOutlined />
              </Button>
            </Dropdown>
          ),
        ]}
        tableAlertRender={renderTableAlert}
        rowSelection={{ type: 'checkbox' }}
        request={doRequest}
        pagination={{
          showTotal: renderPageTotal,
          showSizeChanger: true,
        }}
      />
    </PageHeaderWrapper>
  );
}

export default connect(({ article, login }: ConnectState) => ({
  ...article,
  login: login.currentUser,
}))(ArticleList);
