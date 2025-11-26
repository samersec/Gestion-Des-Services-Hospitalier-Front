import { useAuth } from '@/contexts/AuthContext';
import MedecinOrders from '@/pages/medecin/Orders';
import PharmacienOrders from '@/pages/pharmacien/Orders';

const Orders = () => {
  const { user } = useAuth();

  if (user?.role === 'pharmacien') {
    return <PharmacienOrders />;
  }

  return <MedecinOrders />;
};

export default Orders;
