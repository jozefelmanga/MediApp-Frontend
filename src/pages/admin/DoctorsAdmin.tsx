import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { doctorsApi, usersApi, Doctor } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DoctorsAdmin = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // prefer doctorsApi.getAll if available, otherwise fallback to usersApi.getAllDoctors
        const res = await doctorsApi.getAll();
        if (mounted) setDoctors(res || []);
      } catch (err) {
        try {
          const res2 = await usersApi.getAllDoctors();
          if (mounted) setDoctors(res2 || []);
        } catch (err2) {
          console.error('Failed to load doctors', err2);
        }
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
          <p className="text-muted-foreground mt-2">You must be an administrator to view doctors.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">All Doctors</h1>
          <div className="space-x-2">
            <Button asChild>
              <Link to="/admin/doctors/new">Add Doctor</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {doctors.length === 0 ? (
              <p className="text-muted-foreground">No doctors found.</p>
            ) : (
              <div className="grid gap-2">
                {doctors.map((d) => (
                  <div key={d.doctorId} className="p-3 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Dr. {d.firstName} {d.lastName}</div>
                        <div className="text-xs text-muted-foreground">{d.email} • {d.specialtyName}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {d.doctorId}</div>
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

export default DoctorsAdmin;
