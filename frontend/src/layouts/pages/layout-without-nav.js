// src/components/Layout.js
import React from "react";
import TopBar from "../TopBar";
import Sidebar from "../Siderbar";
import RightSidebar from "../Right-siderbar";
import Footer from "../Footer";


const LayoutWithoutNav = ({ children }) => {
  return (
    <div id="layout-wrapper">
      {/*Este layout se encarga de organizar cada uno de los pages con layouts y dar estructura a la pagina */}
        <Sidebar/>
        <TopBar/>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
        
            {children}
            </div>
        </div>
        <Footer />
      </div>
      <RightSidebar />
    </div>
  );
};

export default LayoutWithoutNav;
