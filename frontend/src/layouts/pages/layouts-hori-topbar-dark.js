// src/components/LayoutsHoriTopbarDark.js
import React from "react";
import TopBar from "../TopBar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import Footer from "../Footer";

const LayoutsHoriTopbarDark = ({ children }) => {
  return (
    <div id="layout-wrapper">
      {/* Este layout organiza las páginas y proporciona la estructura principal */}
      
      {/* Sidebar */}
      <Sidebar />

      {/* Topbar */}
      <TopBar />

      <div className="main-content overflow-hidden">
        <div className="page-content">
          <div className="container-fluid">
            {/* Aquí se renderizan los hijos (el contenido de la página) */}
            {children}
          </div>
        </div>
        {/* Footer */}
        <Footer />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
      
    </div>
  );
};

export default LayoutsHoriTopbarDark;
