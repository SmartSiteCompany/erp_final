import { useMemo } from 'react';
import { getUsuarioByArea } from '../helpers'
import { UsuarioCard } from './UsuarioCard';

export const UsuarioList = ({ area }) => {
    const usuarios = useMemo(() => getUsuarioByArea(area), [area]);

    return (
        <div className='row rows-cols-1 row-cols-md-3 g-3'>
            {
                usuarios.map(user => (
                    <UsuarioCard
                        key={user.id} {...user}
                    />
                ))
            }
        </div>
    );
};