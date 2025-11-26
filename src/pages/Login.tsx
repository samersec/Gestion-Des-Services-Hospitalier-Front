import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const quickLoginAccounts = [
    { email: 'admin@hopital.fr', role: 'Administrateur' },
    { email: 'patient@hopital.fr', role: 'Patient' },
    { email: 'medecin@hopital.fr', role: 'Médecin' },
    { email: 'pharmacien@hopital.fr', role: 'Pharmacien' },
    { email: 'donnateur@hopital.fr', role: 'Donateur' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
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
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre espace personnel
            </CardDescription>
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
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Comptes de test</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {quickLoginAccounts.map((account) => (
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
    </div>
  );
};

export default Login;
