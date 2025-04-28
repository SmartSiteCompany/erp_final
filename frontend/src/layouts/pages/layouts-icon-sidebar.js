// src/components/LayoutsIconSidebar.js
import React from "react";
import Sidebar from "../Siderbar";  // Asegúrate de tener este componente Sidebar
import RightSidebar from "../Right-siderbar";
import Footer from "../Footer";
import TopBar from "../TopBar";

const LayoutsIconSidebar = ({ children}) => {
  return (
    <div id="layout-wrapper">
      {/* Sidebar con iconos */}
      <Sidebar />
      <TopBar/>

      <div className="main-content overflow-hidden">
        <div className="page-content">
          <div className="container-fluid">
            {/* Aquí se renderizan los hijos (contenido de la página) */}
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

export default LayoutsIconSidebar;
