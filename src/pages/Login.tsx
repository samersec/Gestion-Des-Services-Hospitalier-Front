import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

type LoginType = 'user' | 'admin';

const Login = () => {
  const [loginType, setLoginType] = useState<LoginType>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Si déjà connecté (token + user en mémoire), ne pas rester sur la page de login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Rediriger en fonction du rôle si besoin
      if (user.role === 'admin') {
        navigate('/users', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  const userAccounts = [
    { email: 'patient@hopital.fr', role: 'Patient' },
    { email: 'medecin@hopital.fr', role: 'Médecin' },
    { email: 'donnateur@hopital.fr', role: 'Donateur' }
  ];

  const adminAccounts = [
    { email: 'admin@hopital.fr', role: 'Administrateur' },
    { email: 'pharmacien@hopital.fr', role: 'Pharmacien' }
  ];

  const quickLoginAccounts = loginType === 'user' ? userAccounts : adminAccounts;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-5xl">
        {/* Toggle Buttons */}
       

        {/* User Login Interface */}
        {loginType === 'user' && (
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="hidden lg:block space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold">HôpitalApp</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Plateforme de gestion hospitalière moderne et sécurisée
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestion Simplifiée</h3>
                    <p className="text-sm text-muted-foreground">Accédez à toutes vos informations médicales en un clic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sécurisé</h3>
                    <p className="text-sm text-muted-foreground">Vos données sont protégées et confidentielles</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="w-full">
              <CardHeader className="space-y-1">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">HôpitalApp</CardTitle>
                </div>
                <CardTitle className="text-2xl">Connexion Utilisateur</CardTitle>
                
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    
                  </div>
                  
                 
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Login Interface */}
        {loginType === 'admin' && (
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="hidden lg:block space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-bold">HôpitalApp Admin</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Espace d'administration sécurisé
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-600/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Contrôle Total</h3>
                    <p className="text-sm text-muted-foreground">Gérez les utilisateurs et les configurations du système</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-600/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sécurisé</h3>
                    <p className="text-sm text-muted-foreground">Accès restreint aux administrateurs et pharmaciens uniquement</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="w-full border-red-200">
              <CardHeader className="space-y-1 bg-red-50">
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Admin Panel</CardTitle>
                </div>
                <CardTitle className="text-2xl">Connexion Administrateur</CardTitle>
                <CardDescription>
                  Connectez-vous à l'espace d'administration (Administrateur, Pharmacien)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@email.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Comptes de test</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {adminAccounts.map((account) => (
                      <Button
                        key={account.email}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setEmail(account.email);
                          setPassword('password123');
                        }}
                      >
                        <span className="font-medium">{account.role}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{account.email}</span>
                      </Button>
                    ))}
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Mot de passe pour tous les comptes : <code className="bg-muted px-1.5 py-0.5 rounded">password123</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
