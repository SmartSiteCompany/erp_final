import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../layouts/Auth/Login";
import Register from "../layouts/Auth/Register";
import ResetPassword from "../layouts/Auth/ResetPassword";
import RecoverPassword from "../layouts/Auth/RecoverPassword";
import PantallaBloqueo from "../layouts/Auth/PantallaBloqueo";


import Profile from "../pages/Perfil/Profile";
import EditarPerfil from "../pages/Perfil/EditarPerfil";


import Home from "../pages/Home";
import Tablero from "../pages/Tablero";
import Cronograma from "../pages/grantt/Cronograma";

import Calendario from "../pages/calendario/Calendario";
import CrearTarea from "../pages/calendario/CrearTarea";
import EditarTarea from "../pages/calendario/EditarTarea";
import VerTarea from "../pages/calendario/VerTarea";

import ListaCotizaciones from "../pages/cotizacion/Lista-cotizacion";
import CrearCotizacion from "../pages/cotizacion/CrearCotizacion";
import DetalleCotizacion from "../pages/cotizacion/Cotizacion";
import EditarCotizacion from "../pages/cotizacion/EditarCotizacion";

import ListaPagos from "../pages/pagos/ListaPagos";
import CrearPago from "../pages/pagos/CrearPago";
import DetallePago from "../pages/pagos/DetallePago";
import EditarPago from "../pages/pagos/EditarPago";

import Reporte from "../pages/Reporte";
import Campana from "../pages/campanas/ListaCampana";
import CrearCampana from "../pages/campanas/CrearCampana";
import DetalleCampana from "../pages/campanas/DetalleCampana";
import EditarCampana from "../pages/campanas/EditarCampana";

import ListaEventos from "../pages/eventos/Lista_Evento";
import CrearEvento from "../pages/eventos/CrearEvento";
import EditarEvento from "../pages/eventos/EditarEvento";
import DetalleEvento from "../pages/eventos/DetalleEvento";

import ListaFiliales from "../pages/Filial/Lista-filial";
import CrearFilial from "../pages/Filial/CrearFilial";
import DetalleFilial from "../pages/Filial/DetalleFilial";
import EditarFilial from "../pages/Filial/EditarFilial";


import ListaClientes from "../pages/clientes/Lista-clientes";
import CrearCliente from "../pages/clientes/CrearCliente";
import DetalleCliente from "../pages/clientes/DetalleCliente";
import EditarCliente from "../pages/clientes/EditarCliente";

import ListaEstadoCuenta from "../pages/estados_cuenta/Lista_EstadoCuenta";
import CrearEstadoCuenta from "../pages/estados_cuenta/CrearEstadoCuenta";

import EstadosFactura from "../pages/facturas/Estados-factura";
import ListaFacturas from "../pages/facturas/Lista-facturas";
import AgregarFactura from "../pages/facturas/Agregar-factura";
import DetalleFactura from "../pages/facturas/InvoicesDetail";

import ListaUsuarios from "../pages/usuarios/Lista-usuarios";
import CrearUsuario from "../pages/usuarios/CrearUsuario";
import EditarUsuario from "../pages/usuarios/EditarUsuario";
import DetalleUsuario from "../pages/usuarios/DetalleUsuario";

import ListaNomina from "../pages/nomina/Lista-nomina";

import ListaInteraccions from "../pages/interaccions/ListaInteraccions";
import CrearInteraccions from "../pages/interaccions/CrearInteraccions";
import DetalleInteraccions from "../pages/interaccions/DetalleInteraccions";
import EditarInteraccions from "../pages/interaccions/EditarInteraccions";

import Nota from "../pages/Nota/Nota";
import CrearNota from "../pages/Nota/CrearNota";
import DetalleNota from "../pages/Nota/DetalleNota";
import EditarNota from "../pages/Nota/EditarNota";

import Grafica1 from "../pages/graficos/grafica1";
import Grafica2 from "../pages/graficos/grafica2";
import Grafica3 from "../pages/graficos/grafica3";

import Card1 from "../pages/cards/card1";
import Card2 from "../pages/cards/card2";
import CardInteraccion from "../pages/cards/CardInteraccion";
import CardUsuario from "../pages/cards/cardUsuario";
import CardTarea from "../pages/cards/cardTarea";

import ListaCatalogo from "../pages/catalogo/ListaCatalogo";
import CrearCatalogo from "../pages/catalogo/CrearCatalogo";
import DetalleCatalogo from "../pages/catalogo/DetalleCatalogo";
import EditarCatalogo from "../pages/catalogo/EditarCatalogo";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
            {/*Login*/}
            <Route path="/" element={<Login/>}/>
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />   
            <Route path="/ResetPassword" element={<ResetPassword />}/>
            <Route path="/RecoverPassword" element={<RecoverPassword />}/>
            <Route path="/PantallaBloqueo" element={<PantallaBloqueo />}/>

            {/*Perfil*/}
            <Route path="/Profile" element={<Profile/>}/>
            <Route path="/Perfil/editar/:id" element={<EditarPerfil/>}/>

            <Route path="/Home" element={<Home />} />

            {/*GRAFICAS */}
            <Route path="/grafica1" element={<Grafica1 />}/>
            <Route path="/grafica2" element={<Grafica2 />}/>
            <Route path="/grafica3" element={<Grafica3 />}/>

            <Route path="/card1" element={<Card1 />}/>
            <Route path="/card2" element={<Card2 />}/>
            <Route path="/cardUsuario" element={<CardUsuario />}/>
            <Route path="/cardTarea" element={<CardTarea />}/>


            <Route path="/Tablero" element={<Tablero />}/>

            <Route path="/Cronograma" element={<Cronograma />}/>

            {/*Tarea*/}
            <Route path="/Calendario" element={<Calendario />}/>
            <Route path="/EditarTarea" element={<EditarTarea />}/>
            <Route path="/CrearTarea" element={<CrearTarea />}/>
            <Route path="/VerTarea" element={<VerTarea />}/>

            {/*Reportes*/}
            <Route path="/Reporte" element={<Reporte />}/>

            {/*Filials*/}
            <Route path="/Filials" element={<ListaFiliales/>}/>
            <Route path="/filial/CrearFilial" element={<CrearFilial/>}/>
            <Route path="/filial/ver/:id" element={<DetalleFilial/>}/>
            <Route path="/filial/editar/:id" element={<EditarFilial/>}/>

            {/*Campañas*/}
            <Route path="/Campanas" element={<Campana />}/>
            <Route path="/Campana/CrearCampana" element={<CrearCampana/>}/>
            <Route path="/Campana/ver/:id" element={<DetalleCampana/>}/>
            <Route path="/Campana/editar/:id" element={<EditarCampana/>}/>

            {/*Servicios Eventos */}
            <Route path="/Lista_Eventos" element={<ListaEventos/>}/>
            <Route path="/evento/CrearEvento" element={<CrearEvento />} />
            <Route path="/evento/editar/:id" element={<EditarEvento />} />
            <Route path="/evento/ver/:id" element={<DetalleEvento />} />

            {/*Cotizacion*/}
            <Route path="/Lista_cotizacion" element={<ListaCotizaciones/>}/>
            <Route path="/Cotizacion/CrearCotizacion" element={<CrearCotizacion/>}/>
            <Route path="/Cotizacion/ver/:id" element={<DetalleCotizacion/>}/>
            <Route path="/Cotizacion/editar/:id" element={<EditarCotizacion/>}/>

            {/*Pagos */}
            <Route path="/Lista_pagos" element={<ListaPagos/>}/>
            <Route path="/Pago/CrearPago" element={<CrearPago/>}/>
            <Route path="/Pago/ver/:id" element={<DetallePago/>}/>
            <Route path="/Pago/editar/:id" element={<EditarPago/>}/>


            {/*Catalogo */}
            <Route path="/Catalogo" element={<ListaCatalogo/>}/>
            <Route path="/productos/CrearProducto" element={<CrearCatalogo/>}/>
            <Route path="/producto/editar/:id" element={<EditarCatalogo/>} />
            <Route path="/producto/ver/:id" element={<DetalleCatalogo />} />

            {/*Clientes*/}
            <Route path="/Lista_clientes" element={<ListaClientes />}/>
            <Route path="/clientes/CrearCliente" element={<CrearCliente />} />
            <Route path="/cliente/editar/:id" element={<EditarCliente/>} />
            <Route path="/cliente/ver/:id" element={<DetalleCliente />} />

            {/*Estados Cuenta */}
            <Route path="/Estados_Cuenta" element={<ListaEstadoCuenta />}/>
            <Route path="/estado/CrearEstado" element={<CrearEstadoCuenta/>} />

            {/*Facturas*/}
            <Route path="/Estados_factura" element={<EstadosFactura />}/>
            <Route path="/Lista_facturas" element={<ListaFacturas />}/>
            <Route path="/facturas/Agregar-factura" element={<AgregarFactura />} />
            <Route path="/InvoicesDetail" element={<DetalleFactura />}/>

            {/*Usuarios*/}
            <Route path="/Lista_usuarios" element={<ListaUsuarios />}/>
            <Route path="/usuarios/CrearUsuario" element={<CrearUsuario />} />
            <Route path="/usuario/editar/:id" element={<EditarUsuario />} />
            <Route path="/usuario/ver/:id" element={<DetalleUsuario />} />

            {/*Nomina*/}
            <Route path="/Lista_nomina" element={<ListaNomina />}/>

            {/*Interaccions*/}
           <Route path="/ListaInteraccions" element={<ListaInteraccions />}/>
           <Route path="/interaccions/CrearInteraccions" element={<CrearInteraccions />} />
           <Route path="/interaccions/ver/:id" element={<DetalleInteraccions/>} />
           <Route path="/interaccions/editar/:id" element={<EditarInteraccions/>} />

            {/*Nota*/}
           <Route path="/Nota" element={<Nota/>}/>
           <Route path="/Nota/CrearNota" element={<CrearNota/>}/>
           <Route path="/Notas/ver/:id" element={<DetalleNota/>}/>
           <Route path="/Notas/editar/:id" element={<EditarNota/>}/>

            </Routes>
        </Router>
    );
};

 export default AppRoutes;