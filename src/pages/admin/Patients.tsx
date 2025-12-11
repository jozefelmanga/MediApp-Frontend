import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usersApi, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await usersApi.getAllPatients();
        if (mounted) setPatients(res || []);
      } catch (err) {
        console.error('Failed to load patients', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') load();
    else setLoading(false);
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="container px-4 py-12 text-center">
          <h2 className="font-display text-2xl font-bold">Access denied</h2>
          <p className="text-muted-foreground mt-2">You must be an administrator to view patients.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">All Patients</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {patients.length === 0 ? (
              <p className="text-muted-foreground">No patients found.</p>
            ) : (
              <div className="grid gap-2">
                {patients.map((p) => (
                  <div key={p.userId} className="p-3 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {p.userId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
