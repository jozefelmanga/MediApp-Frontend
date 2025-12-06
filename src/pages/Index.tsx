import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Shield, 
  Clock, 
  Star,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Stethoscope,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import heroImage from '@/assets/hero-medical.jpg';

const specialties = [
  { icon: Heart, name: 'Cardiology', description: 'Heart & cardiovascular care' },
  { icon: Brain, name: 'Neurology', description: 'Brain & nervous system' },
  { icon: Baby, name: 'Pediatrics', description: 'Child healthcare' },
  { icon: Eye, name: 'Ophthalmology', description: 'Eye care & vision' },
  { icon: Bone, name: 'Orthopedics', description: 'Bone & joint care' },
  { icon: Stethoscope, name: 'General Medicine', description: 'Primary healthcare' },
];

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Book appointments online 24/7 with just a few clicks.',
  },
  {
    icon: Shield,
    title: 'Verified Doctors',
    description: 'All our healthcare professionals are certified and verified.',
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    description: 'Receive immediate confirmation and reminders for your appointments.',
  },
  {
    icon: Star,
    title: 'Quality Care',
    description: 'Access top-rated doctors with excellent patient reviews.',
  },
];

const stats = [
  { value: '500+', label: 'Verified Doctors' },
  { value: '50K+', label: 'Happy Patients' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container px-4 md:px-6 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Trusted by 50,000+ patients
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Health,{' '}
                <span className="text-gradient">Our Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Book appointments with top healthcare professionals. Easy scheduling, 
                instant confirmation, and quality care — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/doctors">
                    Find a Doctor
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="relative lg:pl-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img 
                  src={heroImage} 
                  alt="Modern medical facility with healthcare professionals" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              {/* Floating cards */}
              <div className="absolute -left-4 bottom-8 bg-card rounded-xl p-4 shadow-card animate-float hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Appointment Confirmed</p>
                    <p className="text-xs text-muted-foreground">Dr. Sarah Johnson • 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse by Specialty
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the right healthcare professional for your needs from our wide range of medical specialties.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty, index) => (
              <Link
                key={specialty.name}
                to={`/doctors?specialty=${specialty.name.toLowerCase()}`}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-card transition-all duration-300 text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <specialty.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{specialty.name}</h3>
                <p className="text-xs text-muted-foreground">{specialty.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/specialties">
                View All Specialties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose MediApp?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make healthcare accessible and convenient for everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card p-6 rounded-xl border border-border hover:shadow-card transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-soft">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="relative bg-gradient-primary rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Join thousands of patients who trust MediApp for their healthcare needs. 
                Sign up today and book your first appointment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="xl" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  asChild
                >
                  <Link to="/register">Get Started Free</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/doctors">Browse Doctors</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
