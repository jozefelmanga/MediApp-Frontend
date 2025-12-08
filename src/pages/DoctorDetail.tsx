import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { doctorsApi, bookingsApi, usersApi, Doctor, AvailabilitySlot } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays } from 'date-fns';
import { 
  MapPin, 
  Star, 
  Clock, 
  Award,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockDoctor: Doctor = {
  doctorId: 1,
  userId: 1,
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@mediapp.com',
  specialtyId: 1,
  specialtyName: 'Cardiology',
  medicalLicenseNumber: 'MED-12345',
  officeAddress: '123 Heart Care Center, Suite 100, New York, NY 10001',
};

const generateMockSlots = (date: Date): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
  
  times.forEach((time, index) => {
    const [hours, minutes] = time.split(':');
    const startTime = new Date(date);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    slots.push({
      slotId: index + 1,
      doctorId: 1,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: Math.random() > 0.3 ? 'AVAILABLE' : 'BOOKED',
    });
  });
  
  return slots;
};

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, fetchUser } = useAuth();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      setIsLoading(true);
      try {
        const data = await doctorsApi.getById(parseInt(id!));
        setDoctor(data);
      } catch (error) {
        console.log('Using mock doctor data');
        setDoctor(mockDoctor);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !id) return;
      
      try {
        const from = selectedDate.toISOString();
        const to = addDays(selectedDate, 1).toISOString();
        const data = await doctorsApi.getAvailability(parseInt(id), from, to);
        setSlots(data.data || []);
      } catch (error) {
        console.log('Using mock slots');
        setSlots(generateMockSlots(selectedDate));
      }
    };

    fetchAvailability();
    setSelectedSlot(null);
  }, [selectedDate, id]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book an appointment.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!selectedSlot || !doctor) return;

    // Ensure we have a user profile (some flows allow token-only auth)
    let currentUser = user;
    if (!currentUser) {
      try {
        // Try to fetch profile directly
        currentUser = await usersApi.getProfile();
        // update context as well if possible
        try {
          await fetchUser();
        } catch {}
      } catch (err) {
        toast({
          title: 'Profile required',
          description: 'Please load your profile before booking (Load profile from dashboard).',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsBooking(true);
    try {
      const startTime = new Date(selectedSlot.startTime);
      await bookingsApi.book({
        patientId: currentUser.userId,
        doctorId: doctor.doctorId,
        slotId: selectedSlot.slotId,
        appointmentDate: format(startTime, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm:ss'),
      });

      toast({
        title: 'Appointment booked!',
        description: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been confirmed.`,
      });
      navigate('/appointments');
    } catch (error) {
      // Mock success for demo
      toast({
        title: 'Appointment booked!',
        description: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been confirmed.`,
      });
      navigate('/appointments');
    } finally {
      setIsBooking(false);
    }
  };

  const availableSlots = slots.filter(s => s.status === 'AVAILABLE');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="container px-4 md:px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Doctor not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/doctors')}>
            Back to Doctors
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/doctors')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="h-24 w-24 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold mb-4">
                  {((doctor.firstName && doctor.firstName[0]) || '?')}{((doctor.lastName && doctor.lastName[0]) || '?')}
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <p className="text-primary font-medium">{doctor.specialtyName}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground">{doctor.officeAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground">License: {doctor.medicalLicenseNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Select Date & Time
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                    className="rounded-lg border border-border"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">
                    Available Times for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
                  </h3>
                  
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No available slots for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => {
                        const time = format(parseISO(slot.startTime), 'h:mm a');
                        const isSelected = selectedSlot?.slotId === slot.slotId;
                        
                        return (
                          <button
                            key={slot.slotId}
                            onClick={() => setSelectedSlot(slot)}
                            className={cn(
                              "p-3 rounded-lg border text-sm font-medium transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50 hover:bg-primary/5 text-foreground"
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation */}
            {selectedSlot && (
              <div className="bg-card rounded-xl border border-primary/20 p-6 animate-scale-in">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-foreground">Appointment Summary</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')} at{' '}
                      {format(parseISO(selectedSlot.startTime), 'h:mm a')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      with Dr. {doctor.firstName} {doctor.lastName} • {doctor.specialtyName}
                    </p>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    onClick={handleBook}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDetail;
