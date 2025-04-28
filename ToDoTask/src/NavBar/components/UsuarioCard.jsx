import { Link } from "react-router-dom";

const CharacterByHero = ({ area, correo }) => {
    return (area !== correo) ? <></> : (<p>{correo}</p>);
};

// Componente padre
export const UsuarioCard = ({
    id,
    username,
    email,
    area,
    correo,
}) => {

    const AreaImage = `/assets/image/${ id }.jpg`; 
    // Ruta de la imagen basada en el id del usuario

    return (
        <div className="col animate__animated animate__fadeInLeft">
            <div className="card">
                {/* Fondo amarillo */}
                <div className="row no-gutters bg-grey">
                    <div className="col-4">
                        <img src={AreaImage} className="card-img"  />
                    </div>

                    <div className="col-8">
                        <div className="card-body">
                            <h5 className="card-title">{username}</h5>
                            <p className="card-text">{email}</p>

                            <CharacterByHero area={area} correo={correo} />

                            <p className="card-text">
                                <small className="text-muted">{area}</small>
                            </p>

                            <Link to={`/usuario/${id}`} className="btn btn-primary">
                                Más info...
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
