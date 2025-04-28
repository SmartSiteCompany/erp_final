// src/components/LayoutsPreloader.js
import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";  // Asegúrate de tener este componente Sidebar
import RightSidebar from "../RightSidebar";
import Footer from "../Footer";
import TopBar from "../TopBar";

const LayoutsPreloader = ({ children, headerCss, footerJs }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula el tiempo de carga y luego oculta el preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 segundos de preloader
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="layout-wrapper">
      {/* Preloader */}
      {isLoading && (
        <div id="preloader">
          <div id="status">
            <div className="spinner">
              <i className="uil-shutter-alt spin-icon"></i>
            </div>
          </div>
        </div>
      )}

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

      {/* JavaScript para funcionalidades adicionales */}
      {footerJs && <script src="/assets/js/app.js"></script>}
    </div>
  );
};

export default LayoutsPreloader;
