import { connect } from "dva";
import React from "react";
import { ConnectProps, ConnectState } from "@/models/connect";
import { Article, ArticleState } from "@/models/article";
import { Button, Card, Col, Form, Input, Modal, Radio, Row, Select } from "antd";
import { execute, guid } from "hefang-js";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { FormInstance } from "antd/lib/form";
import { queryArticle, setArticle } from "@/services/article";
import _ from "lodash"
import RichTextEditor from "@/components/RichTextEditor/RichTextEditor";
import { MethodEnum } from "@/utils/request";
import router from "umi/router";

export type ArticleEditorProps = ConnectProps & ArticleState;

export interface ArticleEditorState {
  article: Article | null
  submitting: boolean
}

class ArticleEditor extends React.Component<ArticleEditorProps, ArticleEditorState> {
  private refForm = React.createRef<FormInstance>();
  private infoCardId = guid();
  private id = this.props?.match?.params["id"] || guid();
  private article: Article = {};

  constructor(props: ArticleEditorProps) {
    super(props);
    this.state = {
      article: null,
      submitting: false
    }
  }

  componentDidMount(): void {
    const { dispatch } = this.props;
    const id = this.props?.match?.params["id"];
    execute(dispatch, { type: "article/fetchCategoriesAndTags" });
    id && queryArticle(id).then(res => {
      res.result.content = res.result.content || "";
      this.article = _.cloneDeep(res.result);
      this.setState({ article: res.result });
    })
  }

  resetForm = () => {
    this.refForm.current?.resetFields();
    this.setState({ article: this.article })
  };

  onFormFinish = (values?: Article) => {
    this.setState({ submitting: true });
    setArticle({ ...this.state.article, ...values }, this.props?.match?.params["id"] ? MethodEnum.PUT : MethodEnum.POST)
      .then(res => {
        Modal.success({
          title: "提交成功",
          okText: "去列表页",
          cancelText: "留在本页",
          onOk: () => {
            router.push("/content/articles/list.html")
          }
        })
      }).finally(() => {
      this.setState({ submitting: false });
    });
  };
  renderForm = () => {
    const { categories, tags } = this.props;
    const { article } = this.state;
    const realTags = [...new Set(tags?.map(tag => tag.tag))];
    return <Form layout="vertical" name="article" initialValues={article as Article}
                 ref={this.refForm}
                 onFinish={this.onFormFinish}>
      <Row gutter={15}>
        <Col flex={1}>
          <Form.Item name="content">
            <RichTextEditor config={{ height: window.innerHeight / 2, resize_enabled: false }}/>
          </Form.Item>
        </Col>
        <Col flex={"350px"}>
          <Card
            id={this.infoCardId}
            title="文章信息"
            size="small"
            actions={[
              <Button type={"primary"} htmlType={"submit"} loading={this.state.submitting}>发表</Button>,
              <Button type={"danger"} htmlType={"reset"} onClick={this.resetForm}>还原</Button>
            ]}>
            <Form.Item label="标题" name="title" rules={[{ required: true, message: "请输入文章标题" }]}>
              <Input/>
            </Form.Item>
            <Form.Item label="路径" name="path" rules={[{ required: true, message: "请输入文章访问路径" }]}>
              <Input/>
            </Form.Item>
            <Form.Item label={`分类(${categories.length})`} name="categoryId" rules={[{}]}>
              <Select>
                <Select.Option value={""}>未分类</Select.Option>
                {categories?.map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={`标签(${realTags.length})`} name="tags">
              <Select
                mode={"tags"}
                tokenSeparators={[",", " ", "|", "\n"]}
                placeholder="选择或输入标签"
                allowClear>
                {realTags.map(tag => <Select.Option value={tag}>{tag}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="关键字" name="keywords">
              <Input.TextArea rows={2} style={{ resize: "none" }}/>
            </Form.Item>
            <Form.Item label="描述" name="description">
              <Input.TextArea rows={3} style={{ resize: "none" }}/>
            </Form.Item>

            <Form.Item label="草稿" name="isDraft">
              <Radio.Group>
                <Radio value={true}>保存为草稿</Radio>
                <Radio value={false}>正式发表</Radio>
              </Radio.Group>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  };

  renderSkeleton = () => {
    return <Row gutter={15}>
      <Col flex={1}>
        <Card loading/>
      </Col>
      <Col flex={"350px"}>
        <Card
          loading
          title="文章信息"
          size="small"/>
      </Col>
    </Row>
  };

  render() {
    const { article } = this.state;
    const id = this.props?.match?.params["id"];
    return <PageHeaderWrapper title={id ? "编辑文章" : "新建文章"} key={this.id}>
      {article === null && id ? this.renderSkeleton() : this.renderForm()}
    </PageHeaderWrapper>
  }
}

export default connect(({ article }: ConnectState) => ({ ...article }))(ArticleEditor)
