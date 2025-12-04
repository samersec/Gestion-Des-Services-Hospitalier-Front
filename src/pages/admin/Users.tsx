import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Mail, Phone, Ban, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import { AdminUser } from '@/types';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'patient' as 'patient' | 'medecin' | 'pharmacien' | 'donnateur',
    telephone: '',
    dateNaissance: '',
    groupeSanguin: '',
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'medecin': return 'default';
      case 'patient': return 'secondary';
      case 'pharmacien': return 'secondary';
      case 'donnateur': return 'outline';
      default: return 'outline';
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const { users, total } = await adminApi.getAllUsers();
        // Exclure les utilisateurs avec rôle admin (autre que l'admin connecté)
        const filtered = users.filter(user => user.role !== 'admin');
        setUsers(filtered);
        setTotalUsers(total - (users.length - filtered.length));
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleToggleBlock = async (user: AdminUser) => {
    setUpdatingUserId(user.id);
    try {
      const updated = user.isBlocked
        ? await adminApi.unblockUser(user.id)
        : await adminApi.blockUser(user.id);

      setUsers(prev =>
        prev.map(u => (u.id === updated.id ? updated : u))
      );

      toast.success(
        updated.isBlocked
          ? `Utilisateur ${updated.prenom} ${updated.nom} bloqué`
          : `Utilisateur ${updated.prenom} ${updated.nom} débloqué`
      );
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour de l’utilisateur');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      user.nom.toLowerCase().includes(query) ||
      user.prenom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Administrez tous les comptes utilisateurs</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setShowCreateForm(prev => !prev)}
          >
            <UserPlus className="h-4 w-4" />
            {showCreateForm ? 'Fermer le formulaire' : 'Nouvel utilisateur'}
          </Button>
        </div>

        <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur (nom, email, rôle)..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          </div>

          {/* Formulaire rapide de création d'utilisateur (affiché uniquement quand demandé) */}
          {showCreateForm && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">Créer un nouvel utilisateur</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Input
                  placeholder="Nom"
                  value={newUser.nom}
                  onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
                />
                <Input
                  placeholder="Prénom"
                  value={newUser.prenom}
                  onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Mot de passe"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <Input
                  placeholder="Téléphone"
                  value={newUser.telephone}
                  onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })}
                />
                <Input
                  type="date"
                  value={newUser.dateNaissance}
                  onChange={(e) => setNewUser({ ...newUser, dateNaissance: e.target.value })}
                />
                <Input
                  placeholder="Groupe sanguin (ex: A+)"
                  value={newUser.groupeSanguin}
                  onChange={(e) => setNewUser({ ...newUser, groupeSanguin: e.target.value })}
                />
                <select
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as 'patient' | 'medecin' | 'pharmacien' | 'donnateur',
                    })
                  }
                >
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                  <option value="pharmacien">Pharmacien</option>
                  <option value="donnateur">Donnateur</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={async () => {
                    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.password) {
                      toast.error('Nom, prénom, email et mot de passe sont obligatoires');
                      return;
                    }
                    setIsCreating(true);
                    try {
                      const created = await adminApi.createUser({
                        nom: newUser.nom,
                        prenom: newUser.prenom,
                        email: newUser.email,
                        password: newUser.password,
                        role: newUser.role,
                        telephone: newUser.telephone || undefined,
                        dateNaissance: newUser.dateNaissance || undefined,
                        groupeSanguin: newUser.groupeSanguin || undefined,
                      });

                      if (created.role !== 'admin') {
                        setUsers(prev => [created, ...prev]);
                        setTotalUsers(prev => prev + 1);
                      }

                      setNewUser({
                        nom: '',
                        prenom: '',
                        email: '',
                        password: '',
                        role: 'patient',
                        telephone: '',
                        dateNaissance: '',
                        groupeSanguin: '',
                      });

                      toast.success('Utilisateur créé avec succès');
                    } catch (error: any) {
                      toast.error(error.message || 'Erreur lors de la création de l’utilisateur');
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer l’utilisateur'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs (hors administrateurs)</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Chargement des utilisateurs...'
                : `${filteredUsers.length} utilisateur(s) affiché(s) sur ${totalUsers}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Chargement des utilisateurs...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun utilisateur trouvé
              </p>
            ) : (
            <div className="space-y-3">
                {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary text-lg">
                        {user.prenom[0]}{user.nom[0]}
                      </span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{user.prenom} {user.nom}</p>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                          {user.isBlocked && (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              Bloqué
                            </Badge>
                          )}
                          {user.isArchived && !user.isBlocked && (
                            <Badge variant="outline">
                              Archivé
                            </Badge>
                          )}
                      </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.telephone}
                          </span>
                        )}
                          {user.dateNaissance && (
                            <span className="text-xs">
                              Né(e) le {new Date(user.dateNaissance).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {user.groupeSanguin && (
                            <span className="text-xs">
                              Groupe sanguin: {user.groupeSanguin}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={user.isBlocked ? 'outline' : 'destructive'}
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleBlock(user)}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : user.isBlocked ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Débloquer
                          </>
                        ) : (
                          <>
                            <Ban className="h-3 w-3" />
                            Bloquer
                          </>
                        )}
                  </Button>
                    </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
