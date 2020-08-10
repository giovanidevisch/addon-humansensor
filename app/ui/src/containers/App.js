import React from "react";

import "antd/dist/antd.css";
import "./App.css";
import { Layout } from "antd";

import AppRouter from "../routes";

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Layout className="layout">
      <Header style={{ background: "#3DAEC0" }}>
        <div className="logo" />
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          <AppRouter />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}> TomorrowTech © 2020 <br /> App Version 0.1.0 </Footer>
    </Layout>
  );
}

export default App;
