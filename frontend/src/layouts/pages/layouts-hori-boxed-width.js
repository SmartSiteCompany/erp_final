import React from "react";
import HorizontalMenu from "../Horizontal";
import RightSidebar from "../Right-sidebar";
import Footer from "../Footer";

const LayoutsHoriBoxedWidth = ({ children }) => {
  return (
    <div id="layout-wrapper" data-layout="horizontal" data-topbar="colored" data-layout-size="boxed">
      <HorizontalMenu />
      <div className="main-content overflow-hidden">
        <div className="page-content">
          <div className="container-fluid">{children}</div>
        </div>
        <Footer />
      </div>
      <RightSidebar />
    </div>
  );
};

export default LayoutsHoriBoxedWidth;
