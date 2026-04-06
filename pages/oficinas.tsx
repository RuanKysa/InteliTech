import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ModuloOficinas from '@/components/Modulo_Oficinas';

export default function OficinasPage() {

  return (
    <ProtectedRoute>
      <div>
        <ModuloOficinas />
      </div>
    </ProtectedRoute>
  );
}
