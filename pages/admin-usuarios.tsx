// Página de Administração de Usuários
import React from 'react';
import { GerenciarUsuarios } from '@/components/Modulo_Acessos';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/styles/Home.module.css';

export default function UsuariosPage() {
    return (
        <ProtectedRoute>
            <div className={styles.container}>            
                <main className={styles.main}>
                    <GerenciarUsuarios />
                </main>
            </div>
        </ProtectedRoute>
    );
}
