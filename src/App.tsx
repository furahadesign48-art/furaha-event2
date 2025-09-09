import React from 'react';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import NewHeroSection from './components/NewHeroSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseSection from './components/WhyChooseSection';
import PricingSection from './components/PricingSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import WeddingTemplate from './components/WeddingTemplate';
import BirthdayTemplate from './components/BirthdayTemplate';
import GraduationTemplate from './components/GraduationTemplate';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

interface TemplateData {
  id: string;
  name: string;
  category: string;
  backgroundImage: string;
  title: string;
  invitationText: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  drinkOptions: string[];
  features: string[];
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showWeddingTemplate, setShowWeddingTemplate] = useState(false);
  const [showBirthdayTemplate, setShowBirthdayTemplate] = useState(false);
  const [showGraduationTemplate, setShowGraduationTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    if (isAuthenticated) {
      setShowDashboard(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowDashboard(true);
  };

  const handleLogout = async () => {
    await logout();
    setShowDashboard(false);
    setShowWeddingTemplate(false);
    setShowBirthdayTemplate(false);
    setShowGraduationTemplate(false);
    setSelectedTemplate(null);
  };

  const handleTemplateSelection = (templateData: TemplateData) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setSelectedTemplate(templateData);
    setShowWeddingTemplate(false);
    setShowBirthdayTemplate(false);
    setShowGraduationTemplate(false);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return (
      <ProtectedRoute>
        <Dashboard 
          selectedTemplate={selectedTemplate} 
          userData={user}
          onLogout={handleLogout}
        />
      </ProtectedRoute>
    );
  }

  if (showWeddingTemplate) {
    return (
      <WeddingTemplate 
        onBack={() => setShowWeddingTemplate(false)}
        onSelectTemplate={handleTemplateSelection}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (showBirthdayTemplate) {
    return (
      <BirthdayTemplate 
        onBack={() => setShowBirthdayTemplate(false)}
        onSelectTemplate={handleTemplateSelection}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  if (showGraduationTemplate) {
    return (
      <GraduationTemplate 
        onBack={() => setShowGraduationTemplate(false)}
        onSelectTemplate={handleTemplateSelection}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 font-elegant">
      <Header 
        onLogin={handleLogin}
      />
      <main>
        <NewHeroSection />
        <ServicesSection 
          onViewWeddingTemplate={() => setShowWeddingTemplate(true)}
          onViewBirthdayTemplate={() => setShowBirthdayTemplate(true)}
          onViewGraduationTemplate={() => setShowGraduationTemplate(true)}
        />
        <WhyChooseSection />
        <PricingSection />
      </main>
      <Footer />
      
      {/* Modal d'authentification */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;