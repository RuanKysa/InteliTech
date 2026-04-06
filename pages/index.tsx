import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/Home.module.css";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  href?: string;
  available: boolean;
}

function ModuleCard({ title, description, icon, href, available }: ModuleCardProps) {
  const content = (
    <div className={`${styles.card} ${!available ? styles.cardDisabled : ''}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
      {!available && (
        <span className={styles.badge}>Em Desenvolvimento</span>
      )}
    </div>
  );

  if (available && href) {
    return (
      <Link href={href} className={styles.cardLink}>
        {content}
      </Link>
    );
  }

  return content;
}

export default function Home() {
  const { user } = useAuth();

  const modules = [
    {
      title: "Matrículas",
      description: "Gerencie matrículas, cadastre alunos e anexe documentos.",
      icon: "",
      href: "/matriculas",
      available: true
    },
    {
      title: "Oficinas",
      description: "Gerencie oficinas, professores e agentes responsáveis.",
      icon: "",
      href: "/oficinas",
      available: true
    },
    {
      title: "Chamada",
      description: "Controle de presença e frequência dos alunos.",
      icon: "",
      available: false
    },
  ];

  return (
    <>
      <Head>
        <title>Sistema de Gestão - InteliTech</title>
        <meta name="description" content="Sistema de gerenciamento institucional" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <main className={styles.main}>
          {/* Hero Section */}
          <div className={styles.hero}>
            <h1 className={styles.title}>Sistema de Gestão InteliTech</h1>
            <p className={styles.subtitle}>
              Centro da Juventude Aurélio Romancini Netto
            </p>
          </div>

          {/* Modules Grid */}
          <div className={styles.modulesSection}>
            <h2 className={styles.sectionTitle}>Módulos do Sistema</h2>
            <div className={styles.grid}>
              {modules.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

