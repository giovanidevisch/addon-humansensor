import React from 'react';

import { Layout, Row, Col, Card } from 'antd';

import { colors } from '../../Themes/Colors';
import { withMqtt } from '../../utils/react-mqtt';

class DashBoardContainer extends React.Component {

  subIDs = ['home-assistant/sensor/status', 'home-assistant/pimage'];

  devices = [];

  state = {
    devices: []
  }

  componentDidMount() {
    setTimeout(()=>{
      this.mqttClient = this.props.mqttClient;
      this.subscribe(this.subIDs);
      this.listenToMessages();
    }, 500);
  }

  componentWillUnmount() {
    this.unsubscribe(this.subIDs);
    this.mqttClient = undefined;
  }

  subscribe = (subIDs) => {
    if (subIDs.length < 1) {
      return;
    }
    this.mqttClient.subscribe(subIDs, (error, granted) => { });
  }

  unsubscribe = (subIDs) => {
    if (subIDs.length < 1) {
      return;
    }
    this.mqttClient.unsubscribe(subIDs, { qos: 1, rap: true }, (error) => { });
  }

  parse = (message) => {
    try {
      const item = JSON.parse(message);
      return item;
    } catch (e) {
      return message.toString();
    }
  }

  listenToMessages = () => this.mqttClient.on('message', (topic, message) => {
    const status = this.parse(message);
    let matching_device = this.state.devices.filter(d => d.id === status.id);
    let existing = matching_device.length > 0;
    if(topic === this.subIDs[0]) {
      if(existing) {
        this.devices = this.state.devices.map(d => d.id === status.id ? { ...d, ...status } : { ...d })
        this.setState({
          devices: this.devices
        });
      } else {
        this.setState({
          devices: [...this.state.devices, status]
        });
      }
    } else if (existing) {
      this.devices = this.state.devices.map(d => d.id === status.id ? { ...d, ...status } : { ...d })
      this.setState({
        devices: this.devices
      });
    }
  });

  render() {

    const { devices } = this.state;

    return (
      <Layout className="cover" id="app-header">
        <Layout>
          <Layout.Header style={{ background: colors.white, position: 'fixed', zIndex: 1, padding: 0, width: '100%' }}>
            <h3>&nbsp;&nbsp; HumanSensor - Dashboard</h3>
          </Layout.Header>
          <Layout.Content className="site-layout"
            style={{ padding: '0 50px', marginTop: 64 }}>
            <div style={{ padding: 24, minHeight: 480 }}>
              <div className="site-card-wrapper">
                <Row gutter={16}>
                  {devices.map(d => (<Col key={`id_${d.id}`} span={8}>
                    <Card size="small" type="inner" bordered={false} title={d.id ? d.id : 'NA'}
                      extra={<span>{d.st ? d.st : 'NA'}</span>}
                      style={{ width: 300, margin: 10 }}>
                      <Card.Grid hoverable={false} style={{ width: '50%', margin: 0, padding: 2, border: 0 }}>SW Ver.: {d.sw ? d.sw : 'NA'}</Card.Grid>
                      <Card.Grid hoverable={false} style={{ width: '50%', margin: 0, padding: 2, border: 0 }}>HW Ver.: {d.hw ? d.hw : 'NA'}</Card.Grid>
                      <Card.Grid hoverable={false} style={{ width: '50%', margin: 0, padding: 2, border: 0 }}>Min Temp.: {d.t1 ? d.t1 : 'NA'}</Card.Grid>
                      <Card.Grid hoverable={false} style={{ width: '50%', margin: 0, padding: 2, border: 0 }}>Max Temp.: {d.t2 ? d.t2 : 'NA'}</Card.Grid>
                      <img alt="Heatmap Image" style={{ width: '100%', padding: 5 }} src={`data:image/png;base64,${d.image}`} />
                    </Card>
                  </Col>))
                  }
                </Row>
              </div>
            </div>
          </Layout.Content>
          <Layout.Footer style={{ textAlign: 'center' }}> HumanSensor © 2020 </Layout.Footer>
        </Layout>
      </Layout>
    );
  }
};

export default withMqtt(DashBoardContainer);