import React from "react";
import Horizontal from "../Horizontal";
import RightSidebar from "../Right-sidebar";
import Footer from "../Footer";

const LayoutsHoriPreloader = ({ children }) => {
  return (
    <div id="layout-wrapper" data-layout="horizontal" data-topbar="colored">
      {/* Loader */}
      <div id="preloader">
        <div id="status">
          <div className="spinner">
            <i className="uil-shutter-alt spin-icon"></i>
          </div>
        </div>
      </div>
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

export default LayoutsHoriPreloader;
