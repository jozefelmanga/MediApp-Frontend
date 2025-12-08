import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Layout>
      <div className="container px-4 md:px-6 py-12">
        <h1 className="font-display text-3xl font-bold mb-4">About MediApp</h1>
        <p className="text-muted-foreground mb-6">
          MediApp helps you find doctors, book appointments, and manage your healthcare in one place.
        </p>
        <p className="mb-4">This is a demo front-end wired to the MediApp Gateway.</p>
        <Link to="/" className="text-primary">Return to Home</Link>
      </div>
    </Layout>
  );
};

export default About;
