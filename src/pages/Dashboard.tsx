import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { PatientDashboard } from '@/components/dashboards/PatientDashboard';
import { MedecinDashboard } from '@/components/dashboards/MedecinDashboard';
import { PharmacienDashboard } from '@/components/dashboards/PharmacienDashboard';
import { DonnateurDashboard } from '@/components/dashboards/DonnateurDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'patient':
        return <PatientDashboard />;
      case 'medecin':
        return <MedecinDashboard />;
      case 'pharmacien':
        return <PharmacienDashboard />;
      case 'donnateur':
        return <DonnateurDashboard />;
      default:
        return <div>Rôle non reconnu</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;
