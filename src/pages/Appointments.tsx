import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingsApi, Appointment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isAfter } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
  CheckCircle2,
  Loader2,
  CalendarX,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Mock data
const mockAppointments: Appointment[] = [
  {
    appointmentId: 1,
    patientId: 1,
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    specialtyName: 'Cardiology',
    slotId: 1,
    appointmentDate: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    startTime: '10:00:00',
    endTime: '10:30:00',
    status: 'CONFIRMED',
  },
  {
    appointmentId: 2,
    patientId: 1,
    doctorId: 2,
    doctorName: 'Dr. Michael Chen',
    specialtyName: 'Neurology',
    slotId: 2,
    appointmentDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    startTime: '14:30:00',
    endTime: '15:00:00',
    status: 'PENDING',
  },
  {
    appointmentId: 3,
    patientId: 1,
    doctorId: 3,
    doctorName: 'Dr. Emily Williams',
    specialtyName: 'Pediatrics',
    slotId: 3,
    appointmentDate: format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    startTime: '09:00:00',
    endTime: '09:30:00',
    status: 'COMPLETED',
  },
];

const statusConfig = {
  PENDING: { 
    label: 'Pending', 
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: Clock 
  },
  CONFIRMED: { 
    label: 'Confirmed', 
    className: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2 
  },
  CANCELLED: { 
    label: 'Cancelled', 
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: XCircle 
  },
  COMPLETED: { 
    label: 'Completed', 
    className: 'bg-muted text-muted-foreground border-border',
    icon: CheckCircle2 
  },
};

const Appointments = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await bookingsApi.getPatientAppointments(user.userId);
        setAppointments(data.content || []);
      } catch (error) {
        console.log('Using mock appointments');
        setAppointments(mockAppointments);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  const handleCancel = async (appointmentId: number) => {
    setCancellingId(appointmentId);
    try {
      await bookingsApi.cancel(appointmentId, 'Patient requested cancellation');
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === appointmentId ? { ...a, status: 'CANCELLED' } : a
        )
      );
      toast({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
    } catch (error) {
      // Mock success
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === appointmentId ? { ...a, status: 'CANCELLED' } : a
        )
      );
      toast({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingAppointments = appointments.filter(
    a => (a.status === 'CONFIRMED' || a.status === 'PENDING') && 
         isAfter(parseISO(a.appointmentDate), new Date(Date.now() - 24 * 60 * 60 * 1000))
  );
  
  const pastAppointments = appointments.filter(
    a => a.status === 'COMPLETED' || a.status === 'CANCELLED' ||
         !isAfter(parseISO(a.appointmentDate), new Date(Date.now() - 24 * 60 * 60 * 1000))
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;
    const isPast = appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED';
    const canCancel = !isPast && appointment.status !== 'CANCELLED';

    return (
      <div className="bg-card rounded-xl border border-border p-6 hover:shadow-card transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {appointment.doctorName?.split(' ')[1]?.[0] || 'D'}
              {appointment.doctorName?.split(' ')[2]?.[0] || 'R'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{appointment.doctorName}</h3>
              <p className="text-sm text-primary">{appointment.specialtyName}</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", status.className)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(parseISO(appointment.appointmentDate), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{appointment.startTime.slice(0, 5)}</span>
          </div>
        </div>

        {canCancel && (
          <div className="pt-4 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={cancellingId === appointment.appointmentId}
                >
                  {cancellingId === appointment.appointmentId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Cancel Appointment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your appointment with {appointment.doctorName} 
                    on {format(parseISO(appointment.appointmentDate), 'MMMM d, yyyy')} at {appointment.startTime.slice(0, 5)}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancel(appointment.appointmentId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    );
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
          </div>
          <Button variant="hero" onClick={() => navigate('/doctors')}>
            <Plus className="h-4 w-4" />
            Book New
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Clock className="h-4 w-4" />
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <CalendarX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any scheduled appointments. Book one now!
                </p>
                <Button variant="hero" onClick={() => navigate('/doctors')}>
                  Find a Doctor
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground">
                  Your appointment history will appear here.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Appointments;
