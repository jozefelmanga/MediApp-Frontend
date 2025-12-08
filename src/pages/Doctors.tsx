import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { doctorsApi, Doctor, Specialty } from '@/lib/api';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar,
  Loader2,
  Filter,
  Stethoscope
} from 'lucide-react';

// Mock data for demo (when API is not available)
const mockDoctors: Doctor[] = [
  {
    doctorId: 1,
    userId: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@mediapp.com',
    specialtyId: 1,
    specialtyName: 'Cardiology',
    medicalLicenseNumber: 'MED-12345',
    officeAddress: '123 Heart Care Center, Suite 100',
  },
  {
    doctorId: 2,
    userId: 2,
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@mediapp.com',
    specialtyId: 3,
    specialtyName: 'Neurology',
    medicalLicenseNumber: 'MED-23456',
    officeAddress: '456 Brain & Spine Institute',
  },
  {
    doctorId: 3,
    userId: 3,
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@mediapp.com',
    specialtyId: 4,
    specialtyName: 'Pediatrics',
    medicalLicenseNumber: 'MED-34567',
    officeAddress: '789 Children\'s Health Plaza',
  },
  {
    doctorId: 4,
    userId: 4,
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@mediapp.com',
    specialtyId: 2,
    specialtyName: 'Dermatology',
    medicalLicenseNumber: 'MED-45678',
    officeAddress: '321 Skin Care Clinic',
  },
  {
    doctorId: 5,
    userId: 5,
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@mediapp.com',
    specialtyId: 5,
    specialtyName: 'Orthopedics',
    medicalLicenseNumber: 'MED-56789',
    officeAddress: '654 Joint & Bone Center',
  },
  {
    doctorId: 6,
    userId: 6,
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@mediapp.com',
    specialtyId: 6,
    specialtyName: 'General Medicine',
    medicalLicenseNumber: 'MED-67890',
    officeAddress: '987 Family Health Clinic',
  },
];

const mockSpecialties: Specialty[] = [
  { specialtyId: 1, name: 'Cardiology' },
  { specialtyId: 2, name: 'Dermatology' },
  { specialtyId: 3, name: 'Neurology' },
  { specialtyId: 4, name: 'Pediatrics' },
  { specialtyId: 5, name: 'Orthopedics' },
  { specialtyId: 6, name: 'General Medicine' },
];

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    searchParams.get('specialty') || 'all'
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [doctorsData, specialtiesData] = await Promise.all([
          doctorsApi.getAll(selectedSpecialty !== 'all' ? parseInt(selectedSpecialty) : undefined),
          doctorsApi.getSpecialties(),
        ]);
        setDoctors(doctorsData);
        setSpecialties(specialtiesData);
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock data');
        setDoctors(mockDoctors);
        setSpecialties(mockSpecialties);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSpecialty]);

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    if (value === 'all') {
      searchParams.delete('specialty');
    } else {
      searchParams.set('specialty', value);
    }
    setSearchParams(searchParams);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialtyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = 
      selectedSpecialty === 'all' || 
      doctor.specialtyId.toString() === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find a Doctor
          </h1>
          <p className="text-muted-foreground">
            Browse our network of qualified healthcare professionals
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.specialtyId} value={specialty.specialtyId.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No doctors found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <Link
                  key={doctor.doctorId}
                  to={`/doctors/${doctor.doctorId}`}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-card hover:border-primary/30 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
                      {((doctor.firstName && doctor.firstName[0]) || '?')}{((doctor.lastName && doctor.lastName[0]) || '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        Dr. {doctor.firstName || 'Unknown'} {doctor.lastName || ''}
                      </h3>
                      <p className="text-sm text-primary font-medium">{doctor.specialtyName || '—'}</p>
                      {/* rating & reviews removed — backend returns only basic doctor info */}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{doctor.officeAddress}</span>
                    </div>
                  </div>
                  <Button variant="subtle" size="sm" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Doctors;
