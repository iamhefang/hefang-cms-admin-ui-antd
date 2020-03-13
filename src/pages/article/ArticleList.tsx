import React, { useEffect, useRef, useState } from "react";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Article, ArticleListState, Category } from "@/models/articleList";
import { connect } from "dva";
import ProTable, { ActionType, ProColumns, RequestData } from '@ant-design/pro-table';
import { ConnectProps, ConnectState } from "@/models/connect";
import { UseFetchDataAction } from "@ant-design/pro-table/lib/useFetchData";
import { Button, Divider, Modal, Popconfirm, Tag } from "antd";
import { DeleteOutlined, EditOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons/lib";
import { deleteArticles, queryArticles } from "@/services/article";
import { RestPagerResult } from "@/utils/request";
import { Key, SorterResult } from "antd/es/table/interface";
import { PaginationConfig } from "antd/es/pagination";
import { execute } from "hefang-js";

type ArticleListProps = ConnectProps & ArticleListState;

export interface ArticleListInnerState {
  sortKey?: string | null
  sortType?: string | null
  title?: string | null
  postTime?: string[]
  categoryName?: string | null
  categoryId?: string[] | null
}


function showArticlePreviewModal(article: Article) {
  Modal.info({
    icon: <FileTextOutlined/>,
    title: article.title,
    width: 800,
    okText: "关闭",
    content: <div dangerouslySetInnerHTML={{ __html: article.content }} style={{ height: "100%", overflow: "auto" }}/>
  })
}

function doRequest(params?: ({ pageSize?: number, current?: number } & ArticleListInnerState)): Promise<RequestData<Article>> {
  const { pageSize = 10, current = 1, sortKey = "", sortType = "", title, postTime, categoryId } = params || {};
  const query: string[] = [];
  if (title) {
    query.push(`title~=${title}`);
  }
  if (postTime?.length) {
    query.push(`(post_time>=${postTime[0].split(" ")[0]} 00:00:00&post_time<=${postTime[1].split(" ")[0]} 23:59:59)`)
  }
  if (categoryId?.length) {
    query.push(`(${categoryId.map(id => `categoryId=${id}`).join(" OR ")})`)
  }
  return new Promise((resolve, reject) => {
    queryArticles({
      pageSize,
      pageIndex: current,
      sortKey,
      sortType,
      query: query.join("&")
    }).then((res: RestPagerResult<Article>) => {
      resolve({
        data: res.result.data,
        success: true,
        total: res.result.total
      })
    }).catch(reject)
  });
}

function handleCategoriesSearch(categories: Category[]) {
  const valueEnum = {};
  categories.forEach(item => {
    valueEnum["valueEnum" + item.id] = {
      text: item.name
    };
  });
  return valueEnum;
}

function handleCategoriesFilters(categories: Category[]) {
  return categories.map(item => ({
    text: item.name,
    value: item.id
  }))
}

function renderTableAlert(selectedRowKeys: (string | number)[], selectedRows: Article[]) {
  return <div>
    已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
    <span>
        总阅读量: {selectedRows.reduce((pv, cv) => pv + cv.readCount, 0)}&nbsp;&nbsp;
      总点赞量: {selectedRows.reduce((pv, cv) => pv + cv.opposeCount, 0)}
      </span>
  </div>
}

function renderPageTotal(total: number, range: [number, number]) {
  return `共${total}条`
}

function ArticleList(props: ArticleListProps) {
  const { categories = [], current, total, size, data, dispatch } = props;
  useEffect(() => {
    execute(dispatch, {
      type: "articleList/fetchCategories"
    })
  }, categories);
  const refAction = useRef<ActionType>();
  const [state, setState] = useState<ArticleListInnerState>({
    sortKey: null,
    sortType: null
  });
  const columns: ProColumns<Article>[] = [
    {
      title: "编号",
      width: 75,
      align: "center",
      renderText: (text: any, record: Article, index: number, action: UseFetchDataAction<RequestData<Article>>) => {
        return (index + 1) + "";
      }
    },
    {
      title: "标题",
      dataIndex: "title",
      render: (text: React.ReactNode, record: Article, index: number, action: UseFetchDataAction<RequestData<Article>>) => {
        return <Button type="link" onClick={() => showArticlePreviewModal(record)}>{text}</Button>
      },
      valueType: "text",
      formItemProps: {
        placeholder: "请输入标题",
        allowClear: true
      }
    },
    {
      title: "分类",
      sorter: true,
      width: 150,
      dataIndex: "categoryId",
      render: (text, record: Article) => {
        return <a onClick={() => setState({ categoryId: [record.categoryId] })}>{record.categoryName}</a>
      },
      valueEnum: handleCategoriesSearch(categories),
      filters: handleCategoriesFilters(categories),
      formItemProps: {
        placeholder: "请选择分类",
        allowClear: true
      }
    },
    {
      title: "标签",
      width: 150,
      render: (_, record: Article) => {
        return record.tags.length ? record.tags.map(tag => <Tag>{tag}</Tag>) : "无标签"
      }
    },
    {
      title: "阅读",
      width: 80,
      align: "center",
      sorter: true,
      dataIndex: "readCount",
      hideInSearch: true
    },
    {
      title: "点赞",
      width: 80,
      align: "center",
      sorter: true,
      dataIndex: "approvalCount",
      hideInSearch: true
    },
    {
      title: "发表时间",
      width: 120,
      align: "center",
      sorter: true,
      dataIndex: "postTime",
      valueType: "dateRange"
    },
    {
      title: "草稿",
      width: 100,
      sorter: true,
      dataIndex: "isDraft",
      align: "center",
      hideInSearch: true,
      render: (text, record: Article) => {
        return text ? "是" : "否"
      },
      filters: [
        { text: "草稿", value: "1" },
        { text: "已发表", value: "0" }
      ]
    },
    {
      title: "操作",
      width: 120,
      align: "center",
      render: (_, record: Article) => {
        return <>
          <Popconfirm
            title="确定要删除该文章吗?"
            placement="leftBottom"
            onConfirm={() => {
              deleteArticles([record.id]).finally(() => refAction?.current?.reload())
            }}>
            <Button
              type="link"
              title="删除"
              icon={<DeleteOutlined/>}/>
          </Popconfirm>
          <Divider type="vertical"/>
          <Button type="link" icon={<EditOutlined/>} title="编辑"/>
        </>
      }
    }
  ];

  return (
    <PageHeaderWrapper title="文章列表">
      <ProTable<Article>
        headerTitle="文章列表"
        columns={columns}
        dataSource={data}
        onSubmit={(values: ArticleListInnerState) => {
          setState({
            title: "",
            postTime: [],
            categoryName: "",
            categoryId: [],
            ...values
          })
        }}
        rowKey="id"
        actionRef={refAction}
        params={state}
        onChange={(_: PaginationConfig, filters: Record<string, Key[] | null>, sorter: SorterResult<Article> | SorterResult<Article>[]) => {
          const realSorter = Array.isArray(sorter) ? sorter[0] : sorter;
          setState({
            sortType: realSorter?.order?.replace("end", ""),
            sortKey: `${Array.isArray(realSorter.field) ? realSorter.field[0] : (realSorter?.field || "")}`,
            categoryId: filters?.categoryId as string[]
          })
        }}
        toolBarRender={(action, { selectedRows }) => [<Button type="primary">
          <PlusOutlined/> 新建
        </Button>]}
        tableAlertRender={renderTableAlert}
        rowSelection={{ type: "checkbox" }}
        request={doRequest}
        pagination={{
          current,
          total,
          pageSize: size,
          showTotal: renderPageTotal,
          showSizeChanger: true
        }}/>
    </PageHeaderWrapper>
  );
}

export default connect(({ articleList }: ConnectState) => ({ ...articleList }))(ArticleList)
