import React from "react";
import Layout from "../layouts/pages/layout";
import Grafica1 from "./graficos/grafica1";
import Grafica2 from "./graficos/grafica2";
import Card1 from "./cards/card1";
import Grafica3 from "./graficos/grafica3";
import Card2 from "./cards/card2";
import CardUsuario from "./cards/cardUsuario";

const Home = () => {

  
  return (
    <Layout>
      <Grafica1 />
      <div className="row gx-3" style={{ minHeight: '600px' }}>
  {/* Columna izquierda - Gráfica grande (8/12 en lg, 12/12 en móvil) */}
  <div className="col-lg-8 col-12 h-100 mb-3 mb-lg-0">
    <div className="h-100">
      <Grafica2 />
    </div>
  </div>
  
  {/* Columna derecha - Tarjetas (4/12 en lg, 12/12 en móvil) */}
  <div className="col-lg-4 col-12 h-100">
    <div className="row h-100 g-0" style={{ minHeight: '300px' }}>
      {/* Card2 - Ocupa 40% del espacio vertical */}
      <div className="col-12 p-0" style={{ height: '40%' }}>
        <div className=" h-100">
          <Card1 />
        </div>
      </div>
      
      {/* Card1 - Ocupa 60% del espacio vertical */}
      <div className="col-12 p-0" style={{ height: '60%' }}>
        <div className=" h-100 ">
          <Card2 />
        </div>
      </div>
    </div>
  </div>
</div>

<div className="row ">
    <div className="col-lg-5">
    <Grafica3/>

    </div>
    <div className="col-lg-5">
      <CardUsuario/>
    </div>


  </div>

    </Layout>
  );
};

export default Home;