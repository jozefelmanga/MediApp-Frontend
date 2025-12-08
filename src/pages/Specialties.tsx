import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { doctorsApi, Specialty } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Specialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await doctorsApi.getSpecialties();
        setSpecialties(res || []);
      } catch (err) {
        console.error('Failed to load specialties', err);
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Specialties</h1>
        <div className="bg-card rounded-xl border border-border p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : specialties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No specialties found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialties.map((s) => (
                <Link key={s.specialtyId} to={`/doctors?specialtyId=${s.specialtyId}`} className="p-4 rounded-lg border border-border hover:shadow-card">
                  <h3 className="font-semibold">{s.name}</h3>
                  {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Specialties;
