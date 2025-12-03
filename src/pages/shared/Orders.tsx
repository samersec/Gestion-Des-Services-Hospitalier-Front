import { useAuth } from '@/contexts/AuthContext';
import MedecinOrders from '@/pages/medecin/Orders';
import PharmacienOrders from '@/pages/pharmacien/Orders';
import PatientOrders from '@/pages/patient/Orders';

const Orders = () => {
  const { user } = useAuth();

  if (user?.role === 'pharmacien') {
    return <PharmacienOrders />;
  }

  if (user?.role === 'patient') {
    return <PatientOrders />;
  }

  return <MedecinOrders />;
};

export default Orders;
