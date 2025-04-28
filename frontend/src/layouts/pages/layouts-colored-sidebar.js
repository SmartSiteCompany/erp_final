import React from "react";
import RightSidebar from "../RightSidebar";
import Footer from "../Footer";
import Sidebar from "../Siderbar";
import TopBar from "../TopBar";

const LayoutColoredSidebar = ({ children }) => {
  return (
    <div id="layout-wrapper" data-sidebar="colored">
      <Sidebar />
      <TopBar/>
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

export default LayoutColoredSidebar;
