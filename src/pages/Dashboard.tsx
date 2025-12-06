import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Bell, 
  User,
  ArrowRight,
  Search,
  CalendarPlus,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const quickActions = [
    {
      icon: Search,
      title: 'Find a Doctor',
      description: 'Search for healthcare professionals',
      link: '/doctors',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: CalendarPlus,
      title: 'Book Appointment',
      description: 'Schedule your next visit',
      link: '/doctors',
      color: 'bg-success/10 text-success',
    },
    {
      icon: Calendar,
      title: 'My Appointments',
      description: 'View and manage bookings',
      link: '/appointments',
      color: 'bg-info/10 text-info',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Check your updates',
      link: '/notifications',
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-primary rounded-2xl p-8 mb-8 text-primary-foreground">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-primary-foreground/80">
                Manage your health journey with MediApp
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="group bg-card rounded-xl border border-border p-5 hover:shadow-card hover:border-primary/30 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </h2>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="text-foreground font-medium">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground font-medium">{user.phoneNumber}</span>
                </div>
              )}
              {user.dateOfBirth && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="text-foreground font-medium">{user.dateOfBirth}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Appointment
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/appointments">View All</Link>
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  SJ
                </div>
                <div>
                  <p className="font-medium text-foreground">Dr. Sarah Johnson</p>
                  <p className="text-sm text-primary">Cardiology</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Dec 8, 2025</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>10:00 AM</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/appointments">
                Manage Appointments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
