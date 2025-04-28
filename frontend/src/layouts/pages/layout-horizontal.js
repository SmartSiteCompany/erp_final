import React from "react";
import Horizontal from "../Horizontal";
import RightSidebar from "../RightSidebar";
import Footer from "../Footer";

const LayoutHorizontal = ({ children }) => {
  return (
    <div id="layout-wrapper" data-layout="horizontal" data-topbar="colored">
      <Horizontal />
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

export default LayoutHorizontal;
