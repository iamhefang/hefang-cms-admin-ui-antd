import { connect } from "dva";
import SettingForm from "@/components/SettingForm/SettingForm";
import React from "react";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import { Button, Card, Skeleton } from "antd";
import { queryAllSettingCategories } from "@/services/setting";

class SettingCenter extends React.Component {

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    queryAllSettingCategories().then((res) => {
      this.setState({ settings: res.result.data })
    })
  }

  render() {
    return <PageHeaderWrapper title="配置中心">
      <Card>
        <Skeleton loading={!this.state?.settings}>
          <SettingForm settings={this.state?.settings}/>
          <div className="button-container">
            <Button type="primary">保存</Button>
          </div>
        </Skeleton>
      </Card>
    </PageHeaderWrapper>
  }
}

export default connect()(SettingCenter)
