import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="container px-4 py-12 text-center">
          <h2 className="font-display text-2xl font-bold">Access denied</h2>
          <p className="text-muted-foreground mt-2">You must be an administrator to access this area.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold">Manage Patients</h3>
            <p className="text-sm text-muted-foreground mt-2">View and search all patients.</p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/admin/patients">View Patients</Link>
              </Button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold">Manage Doctors</h3>
            <p className="text-sm text-muted-foreground mt-2">View, create and edit doctor profiles.</p>
            <div className="mt-4 space-x-2">
              <Button asChild>
                <Link to="/admin/doctors">View Doctors</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/doctors/new">Add Doctor</Link>
              </Button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="font-semibold">System</h3>
            <p className="text-sm text-muted-foreground mt-2">Health checks, logs and integrations.</p>
            <div className="mt-4">
              <Button asChild variant="ghost">
                <Link to="/about">About</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
