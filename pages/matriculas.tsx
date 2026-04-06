import Head from 'next/head';
import ModuloMatricula from '@/components/Modulo_Matricula';

export default function MatriculasPage() {
  return (
    <>
      <Head>
        <title>Gerenciamento de Matrículas - Sistema Social</title>
        <meta name="description" content="Sistema de gerenciamento de matrículas para empresa social" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ModuloMatricula />
    </>
  );
}
