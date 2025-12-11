import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usersApi, doctorsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AddDoctor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [medicalLicenseNumber, setMedicalLicenseNumber] = useState('');
  const [specialtyId, setSpecialtyId] = useState<number | ''>('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="container px-4 py-12 text-center">
          <h2 className="font-display text-2xl font-bold">Access denied</h2>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First register the user as a doctor (admin-only endpoint)
      const registerData = {
        email,
        password,
        firstName,
        lastName,
        medicalLicenseNumber,
        specialtyId: Number(specialtyId),
        officeAddress,
      };
      const regResp = await usersApi.registerDoctor(registerData);
      const newUserId = regResp?.data?.userId;

      if (newUserId && specialtyId) {
        // Create doctor profile
        await doctorsApi.createProfile({
          userId: newUserId,
          medicalLicenseNumber,
          specialtyId: Number(specialtyId),
          officeAddress,
        });
      }

      toast({ title: 'Doctor created', description: 'The doctor account was created.' });
      navigate('/admin/doctors');
    } catch (err) {
      console.error('Failed to add doctor', err);
      toast({ title: 'Error', description: 'Failed to add doctor', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8">
        <h1 className="font-display text-2xl font-bold mb-4">Add Doctor</h1>

        <form onSubmit={handleSubmit} className="grid gap-4 max-w-lg">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Medical license number</Label>
            <Input value={medicalLicenseNumber} onChange={(e) => setMedicalLicenseNumber(e.target.value)} />
          </div>
          <div>
            <Label>Specialty ID</Label>
            <Input value={specialtyId === '' ? '' : String(specialtyId)} onChange={(e) => setSpecialtyId(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <Label>Office address</Label>
            <Input value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} />
          </div>

          <div>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Doctor'}</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddDoctor;
