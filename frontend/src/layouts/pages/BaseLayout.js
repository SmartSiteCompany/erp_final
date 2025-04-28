// src/components/BaseLayout.js
import React from "react";
import TopBar from "../TopBar";
import Sidebar from "../Siderbar";
import RightSidebar from "../Right-siderbar";
import Footer from "../Footer";

const BaseLayout = ({
  sidebar,
  topbar,
  rightSidebar,
  footer,
  layoutId,
  dataAttributes,
  children,
  preloader,
}) => {
  return (
    <div id="layout-wrapper" {...dataAttributes}>
      {preloader && (
        <div id="preloader">
          <div id="status">
            <div className="spinner">
              <i className="uil-shutter-alt spin-icon"></i>
            </div>
          </div>
        </div>
      )}
      {sidebar && <Sidebar />}
      {topbar && <TopBar />}
      <div className="main-content overflow-hidden">
        <div className="page-content">
          <div className="container-fluid">{children}</div>
        </div>
        {footer && <Footer />}
      </div>
      {rightSidebar && <RightSidebar />}
    </div>
  );
};

export default BaseLayout;