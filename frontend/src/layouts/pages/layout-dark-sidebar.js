import React from "react";
import TopBar from "../TopBar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import Footer from "../Footer";

const LayoutDarkSidebar = ({ children }) => {
  return (
    <div id="layout-wrapper" data-sidebar="dark">
      <Sidebar />
      <TopBar />
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

export default LayoutDarkSidebar;
