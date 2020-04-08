import { connect } from 'dva';
import SettingForm from '@/components/SettingForm/SettingForm';
import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Card, Skeleton } from 'antd';
import { queryAllSettingCategories, saveSettings, SettingCategory } from '@/services/setting';
import { FormInstance } from 'antd/lib/form';

class SettingCenter extends React.Component<
  any,
  { settings: SettingCategory[]; loading: boolean }
> {
  private form?: FormInstance | null;

  constructor(props: any) {
    super(props);
    this.state = {
      settings: [],
      loading: true,
    };
  }

  componentDidMount(): void {
    this.fetchData();
  }

  private fetchData = () => {
    queryAllSettingCategories().then(res => {
      this.setState({ settings: res.result.data, loading: false });
    });
  };

  private doSubmit = () => {
    this.form?.validateFields().then(values => {
      this.setState({ loading: true });
      saveSettings(values).then(() => {
        this.fetchData();
      });
    });
  };

  render() {
    return (
      <PageHeaderWrapper title="配置中心">
        <Card>
          <Skeleton loading={this.state.loading}>
            <SettingForm
              settings={this.state.settings}
              formRef={form => {
                this.form = form;
              }}
            />
            <div className="button-container">
              <Button type="primary" onClick={this.doSubmit}>
                保存
              </Button>
            </div>
          </Skeleton>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default connect()(SettingCenter);
