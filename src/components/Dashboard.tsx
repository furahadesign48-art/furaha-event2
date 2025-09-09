import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Menu, 
  X, 
  Palette, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Crown,
  ChevronRight,
  Sparkles,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  UserCheck,
  Heart,
  FileText,
  FileSpreadsheet,
  Copy,
  MessageCircle,
  Mail,
  Check,
  ChevronDown,
  Wine,
  MessageSquare,
  Clock,
  Table
} from 'lucide-react';
import TemplateCustomization from './TemplateCustomization';
import TableManagement from './TableManagement';

interface Guest {
  id: string;
  name: string;
  table: number;
  status: 'simple' | 'couple';
}

interface GuestFormData {
  name: string;
  table: number;
  status: 'simple' | 'couple';
}

interface TemplateData {
  id: string;
  name: string;
  category: string;
  image: string;
  colors: string[];
  features: string[];
}

interface DashboardProps {
  selectedTemplate?: TemplateData | null;
}

const Dashboard = ({ selectedTemplate: initialTemplate }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState('personnalisation');
  
  // État des tables déplacé depuis TableManagement
  const [tables, setTables] = useState([
    { 
      id: 1, 
      name: 'Table des Mariés', 
      seats: 8,
      assignedGuests: [
        { id: 1, name: 'Sophie Martin', status: 'confirmed' },
        { id: 2, name: 'Lucas Dubois', status: 'confirmed' },
        { id: 3, name: 'Marie Leroy', status: 'confirmed' },
        { id: 4, name: 'Pierre Moreau', status: 'pending' },
        { id: 5, name: 'Julie Bernard', status: 'confirmed' },
        { id: 6, name: 'Thomas Petit', status: 'confirmed' }
      ]
    },
    { 
      id: 2, 
      name: 'Table Famille', 
      seats: 10,
      assignedGuests: [
        { id: 7, name: 'Jean Martin', status: 'confirmed' },
        { id: 8, name: 'Claire Martin', status: 'confirmed' },
        { id: 9, name: 'Paul Dubois', status: 'pending' },
        { id: 10, name: 'Anne Dubois', status: 'confirmed' },
        { id: 11, name: 'Michel Leroy', status: 'declined' },
        { id: 12, name: 'Sylvie Leroy', status: 'confirmed' },
        { id: 13, name: 'Robert Martin', status: 'confirmed' },
        { id: 14, name: 'Françoise Martin', status: 'pending' }
      ]
    },
    { 
      id: 3, 
      name: 'Table Amis', 
      seats: 8,
      assignedGuests: [
        { id: 15, name: 'Emma Rousseau', status: 'confirmed' },
        { id: 16, name: 'Hugo Blanc', status: 'confirmed' },
        { id: 17, name: 'Léa Garnier', status: 'pending' },
        { id: 18, name: 'Nathan Roux', status: 'confirmed' },
        { id: 19, name: 'Chloé Simon', status: 'confirmed' }
      ]
    },
    { 
      id: 4, 
      name: 'Table Collègues', 
      seats: 6,
      assignedGuests: [
        { id: 20, name: 'David Laurent', status: 'confirmed' },
        { id: 21, name: 'Sarah Michel', status: 'pending' },
        { id: 22, name: 'Antoine Girard', status: 'confirmed' },
        { id: 23, name: 'Camille Durand', status: 'declined' }
      ]
    },
    { 
      id: 5, 
      name: 'Table Enfants', 
      seats: 4,
      assignedGuests: [
        { id: 24, name: 'Lucas Martin', status: 'confirmed' },
        { id: 25, name: 'Emma Dubois', status: 'confirmed' },
        { id: 26, name: 'Noah Leroy', status: 'pending' }
      ]
    }
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([
    { id: '1', name: 'Sophie Martin', table: 1, status: 'couple' },
    { id: '2', name: 'Lucas Dubois', table: 1, status: 'couple' },
    { id: '3', name: 'Marie Leroy', table: 2, status: 'simple' },
    { id: '4', name: 'Pierre Moreau', table: 2, status: 'simple' },
    { id: '5', name: 'Julie & Thomas', table: 3, status: 'couple' },
    { id: '6', name: 'Emma Laurent', table: 4, status: 'simple' },
  ]);
  const [guestFormData, setGuestFormData] = useState({ name: '', email: '', status: 'pending', tableId: '', tableNumber: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByTable, setSortByTable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    table: 1,
    status: 'simple'
  });
  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(initialTemplate || null);
  const [customizedTemplates, setCustomizedTemplates] = useState<TemplateData[]>([]);

  // Si un template est passé en prop, aller directement à la personnalisation
  React.useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      setActiveSection('personnalisation');
    }
  }, [initialTemplate]);

  // Mock data for real-time interactions
  const drinkChoices = [
    { id: 1, guestName: 'Sophie Martin', drink: 'Champagne', table: 'Table 1', timestamp: '14:30' },
    { id: 2, guestName: 'Lucas Dubois', drink: 'Vin Rouge', table: 'Table 2', timestamp: '14:32' },
    { id: 3, guestName: 'Marie Leroy', drink: 'Cocktail Signature', table: 'Table 1', timestamp: '14:35' },
    { id: 4, guestName: 'Pierre Moreau', drink: 'Eau Pétillante', table: 'Table 3', timestamp: '14:38' },
    { id: 5, guestName: 'Emma Bernard', drink: 'Champagne', table: 'Table 2', timestamp: '14:40' },
    { id: 6, guestName: 'Thomas Petit', drink: 'Bière Artisanale', table: 'Table 4', timestamp: '14:42' },
  ];

  const guestbookMessages = [
    { id: 1, guestName: 'Sophie Martin', message: 'Félicitations pour ce magnifique mariage ! Que votre amour soit éternel.', date: '2024-01-15', time: '14:25' },
    { id: 2, guestName: 'Marie Leroy', message: 'Une cérémonie absolument parfaite. Merci pour ce moment magique !', date: '2024-01-15', time: '14:30' },
    { id: 3, guestName: 'Pierre Moreau', message: 'Bravo aux mariés ! Une soirée inoubliable nous attend.', date: '2024-01-15', time: '14:33' },
    { id: 4, guestName: 'Emma Bernard', message: 'Tellement émue par cette belle union. Longue vie aux mariés !', date: '2024-01-15', time: '14:36' },
    { id: 5, guestName: 'Thomas Petit', message: 'Merci pour cette invitation. Hâte de célébrer avec vous !', date: '2024-01-15', time: '14:39' },
  ];

  // Données mockées qui changent selon les filtres
  const getFilteredData = () => {
    const baseData = {
      all: {
        month: {
          invitationStatus: [
            { name: 'Confirmés', value: 45, color: '#10B981' },
            { name: 'En attente', value: 25, color: '#F59E0B' },
            { name: 'Refusés', value: 8, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 40, color: '#F59E0B' },
            { name: 'Vin', value: 30, color: '#EF4444' },
            { name: 'Eau', value: 20, color: '#3B82F6' },
            { name: 'Bière', value: 10, color: '#8B5CF6' }
          ]
        },
        week: {
          invitationStatus: [
            { name: 'Confirmés', value: 12, color: '#10B981' },
            { name: 'En attente', value: 8, color: '#F59E0B' },
            { name: 'Refusés', value: 2, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 35, color: '#F59E0B' },
            { name: 'Vin', value: 35, color: '#EF4444' },
            { name: 'Eau', value: 25, color: '#3B82F6' },
            { name: 'Bière', value: 5, color: '#8B5CF6' }
          ]
        },
        today: {
          invitationStatus: [
            { name: 'Confirmés', value: 3, color: '#10B981' },
            { name: 'En attente', value: 2, color: '#F59E0B' },
            { name: 'Refusés', value: 1, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 50, color: '#F59E0B' },
            { name: 'Vin', value: 25, color: '#EF4444' },
            { name: 'Eau', value: 25, color: '#3B82F6' },
            { name: 'Bière', value: 0, color: '#8B5CF6' }
          ]
        }
      },
      table1: {
        month: {
          invitationStatus: [
            { name: 'Confirmés', value: 22, color: '#10B981' },
            { name: 'En attente', value: 12, color: '#F59E0B' },
            { name: 'Refusés', value: 4, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 45, color: '#F59E0B' },
            { name: 'Vin', value: 25, color: '#EF4444' },
            { name: 'Eau', value: 25, color: '#3B82F6' },
            { name: 'Bière', value: 5, color: '#8B5CF6' }
          ]
        },
        week: {
          invitationStatus: [
            { name: 'Confirmés', value: 6, color: '#10B981' },
            { name: 'En attente', value: 4, color: '#F59E0B' },
            { name: 'Refusés', value: 1, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 50, color: '#F59E0B' },
            { name: 'Vin', value: 20, color: '#EF4444' },
            { name: 'Eau', value: 30, color: '#3B82F6' },
            { name: 'Bière', value: 0, color: '#8B5CF6' }
          ]
        },
        today: {
          invitationStatus: [
            { name: 'Confirmés', value: 2, color: '#10B981' },
            { name: 'En attente', value: 1, color: '#F59E0B' },
            { name: 'Refusés', value: 0, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 60, color: '#F59E0B' },
            { name: 'Vin', value: 20, color: '#EF4444' },
            { name: 'Eau', value: 20, color: '#3B82F6' },
            { name: 'Bière', value: 0, color: '#8B5CF6' }
          ]
        }
      },
      table2: {
        month: {
          invitationStatus: [
            { name: 'Confirmés', value: 23, color: '#10B981' },
            { name: 'En attente', value: 13, color: '#F59E0B' },
            { name: 'Refusés', value: 4, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 35, color: '#F59E0B' },
            { name: 'Vin', value: 35, color: '#EF4444' },
            { name: 'Eau', value: 15, color: '#3B82F6' },
            { name: 'Bière', value: 15, color: '#8B5CF6' }
          ]
        },
        week: {
          invitationStatus: [
            { name: 'Confirmés', value: 6, color: '#10B981' },
            { name: 'En attente', value: 4, color: '#F59E0B' },
            { name: 'Refusés', value: 1, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 30, color: '#F59E0B' },
            { name: 'Vin', value: 40, color: '#EF4444' },
            { name: 'Eau', value: 20, color: '#3B82F6' },
            { name: 'Bière', value: 10, color: '#8B5CF6' }
          ]
        },
        today: {
          invitationStatus: [
            { name: 'Confirmés', value: 1, color: '#10B981' },
            { name: 'En attente', value: 1, color: '#F59E0B' },
            { name: 'Refusés', value: 1, color: '#EF4444' }
          ],
          beveragePreferences: [
            { name: 'Jus', value: 40, color: '#F59E0B' },
            { name: 'Vin', value: 30, color: '#EF4444' },
            { name: 'Eau', value: 20, color: '#3B82F6' },
            { name: 'Bière', value: 10, color: '#8B5CF6' }
          ]
        }
      }
    };

    return baseData[selectedTable][selectedPeriod];
  };

  const filteredData = getFilteredData();

  const menuItems = [
    {
      id: 'personnalisation',
      label: 'Personnalisation',
      icon: Palette,
      color: 'from-amber-500 to-rose-500'
    },
    {
      id: 'invites',
      label: 'Gestion des invités',
      icon: Users,
      color: 'from-emerald-500 to-amber-500'
    },
    {
      id: 'statistiques',
      label: 'Statistiques',
      icon: BarChart3,
      color: 'from-purple-500 to-amber-500'
    },
    {
      id: 'rapports',
      label: 'Rapports',
      icon: FileText,
      color: 'from-blue-500 to-amber-500'
    },
    {
      id: 'parametres',
      label: 'Paramètres',
      icon: Settings,
      color: 'from-slate-500 to-amber-500'
    }
  ];

  // Filter and sort guests
  const filteredGuests = guests
    .filter(guest => 
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByTable) {
        return a.table - b.table;
      }
      return a.name.localeCompare(b.name);
    });

  // Calculate total people count
  const totalPeople = guests.reduce((count, guest) => {
    return count + (guest.status === 'couple' ? 2 : 1);
  }, 0);

  const handleAddGuest = () => {
    setEditingGuest(null);
    setFormData({ name: '', table: 1, status: 'simple' });
    setIsModalOpen(true);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({ name: guest.name, table: guest.table, status: guest.status });
    setIsModalOpen(true);
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests(guests.filter(guest => guest.id !== guestId));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuest) {
      // Update existing guest
      setGuests(guests.map(guest => 
        guest.id === editingGuest.id 
          ? { ...guest, ...formData }
          : guest
      ));
    } else {
      // Add new guest
      const newGuest: Guest = {
        id: Date.now().toString(),
        ...formData
      };
      setGuests([...guests, newGuest]);
    }
    
    setIsModalOpen(false);
    setEditingGuest(null);
    setFormData({ name: '', table: 1, status: 'simple' });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Invités - Furaha-Event', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 45);
    
    // Statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total invités: ${guests.length}`, 20, 65);
    doc.text(`Total personnes: ${totalPeople}`, 20, 80);
    
    // Table headers
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Nom', 20, 105);
    doc.text('Table', 80, 105);
    doc.text('Statut', 120, 105);
    doc.text('Nb Personnes', 160, 105);
    
    // Line under headers
    doc.line(20, 110, 190, 110);
    
    // Guest data
    doc.setFont('helvetica', 'normal');
    let yPosition = 125;
    
    filteredGuests.forEach((guest, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.text(guest.name, 20, yPosition);
      doc.text(guest.table.toString(), 80, yPosition);
      doc.text(guest.status === 'couple' ? 'Couple' : 'Simple', 120, yPosition);
      doc.text(guest.status === 'couple' ? '2' : '1', 160, yPosition);
      
      yPosition += 15;
    });
    
    doc.save('liste-invites-furaha-event.pdf');
  };

  const handleExportExcel = () => {
    const exportData = filteredGuests.map(guest => ({
      'Nom': guest.name,
      'Table': guest.table,
      'Statut': guest.status === 'couple' ? 'Couple' : 'Simple',
      'Nombre de personnes': guest.status === 'couple' ? 2 : 1
    }));
    
    // Add summary row
    exportData.push({
      'Nom': '',
      'Table': '',
      'Statut': 'TOTAL',
      'Nombre de personnes': totalPeople
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 25 }, // Nom
      { width: 10 }, // Table
      { width: 15 }, // Statut
      { width: 20 }  // Nombre de personnes
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invités');
    XLSX.writeFile(workbook, 'liste-invites-furaha-event.xlsx');
  };
  const renderGuestManagement = () => {
  // Generate unique invitation link for each guest
  const generateInvitationLink = (guest: Guest): string => {
    const baseUrl = 'https://furaha-event.com/invitation';
    const guestSlug = guest.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `${baseUrl}/${guest.id}-${guestSlug}`;
  };

  // Copy invitation link to clipboard
  const handleCopyLink = async (guest: Guest) => {
    const link = generateInvitationLink(guest);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkId(guest.id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  // Send invitation via WhatsApp
  const handleSendWhatsApp = (guest: Guest) => {
    const link = generateInvitationLink(guest);
    const message = `Bonjour ${guest.name}! 🎉\n\nVous êtes cordialement invité(e) à notre événement.\n\nVoici votre invitation personnalisée :\n${link}\n\nAu plaisir de vous voir ! ✨`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Send invitation via Email
  const handleSendEmail = (guest: Guest) => {
    const link = generateInvitationLink(guest);
    const subject = 'Invitation à notre événement spécial 🎉';
    const body = `Bonjour ${guest.name},\n\nNous avons le plaisir de vous inviter à notre événement.\n\nVoici votre invitation personnalisée :\n${link}\n\nNous espérons vous voir bientôt !\n\nCordialement,\nL'équipe Furaha-Event`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-8">
          <div className="relative mr-4">
            <Users className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
            <div className="absolute inset-0 animate-pulse">
              <Users className="h-10 w-10 text-amber-300 opacity-30" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
            Gestion des invités
          </h1>
        </div>
        
        <div className="bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/20 rounded-3xl shadow-luxury p-8 backdrop-blur-sm border border-amber-200/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-rose-200/10 to-emerald-200/10 rounded-full blur-2xl animate-bounce-slow"></div>
          
          {/* Header with stats and actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl p-4 border border-amber-200/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <UserCheck className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total invités</p>
                    <p className="text-2xl font-bold text-slate-900">{guests.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100 to-amber-100 rounded-2xl p-4 border border-purple-200/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Total personnes</p>
                    <p className="text-2xl font-bold text-slate-900">{totalPeople}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAddGuest}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-3 rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber hover:shadow-luxury transform hover:scale-105 flex items-center space-x-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              <Plus className="h-5 w-5" />
              <span>Ajouter un invité</span>
            </button>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un invité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50/80 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
            
            <button
              onClick={() => setSortByTable(!sortByTable)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                sortByTable
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-glow-amber'
                  : 'bg-neutral-50/80 text-slate-700 border border-amber-200/50 hover:bg-amber-50'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Trier par table</span>
            </button>
          </div>
          
          {/* Export buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={handleExportPDF}
              className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-neutral-50 px-6 py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 font-semibold shadow-glow-rose hover:shadow-luxury transform hover:scale-105 flex items-center justify-center space-x-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              <FileText className="h-5 w-5" />
              <span>Exporter en PDF</span>
            </button>
            
            <button
              onClick={handleExportExcel}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-neutral-50 px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-luxury transform hover:scale-105 flex items-center justify-center space-x-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
              <FileSpreadsheet className="h-5 w-5" />
              <span>Exporter en Excel</span>
            </button>
          </div>
          
          {/* Table */}
          <div className="bg-neutral-50/50 rounded-2xl border border-amber-200/30 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-100/50 to-rose-100/50 border-b border-amber-200/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nom</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Table</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Lien d'invitation</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/20">
                  {filteredGuests.map((guest, index) => (
                    <tr 
                      key={guest.id} 
                      className="hover:bg-amber-50/30 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{guest.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300/50">
                          Table {guest.table}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          guest.status === 'couple'
                            ? 'bg-gradient-to-r from-rose-100 to-pink-200 text-rose-800 border border-rose-300/50'
                            : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300/50'
                        }`}>
                          {guest.status === 'couple' ? (
                            <>
                              <Heart className="h-3 w-3 mr-1" />
                              Couple
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Simple
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          {/* Copy Link Button */}
                          <button
                            onClick={() => handleCopyLink(guest)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                              copiedLinkId === guest.id
                                ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300/50'
                                : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300/50 hover:from-purple-200 hover:to-purple-300'
                            }`}
                          >
                            {copiedLinkId === guest.id ? (
                              <>
                                <Check className="h-4 w-4" />
                                <span>Copié!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>Copier lien</span>
                              </>
                            )}
                          </button>
                          
                          {/* Send Buttons */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSendWhatsApp(guest)}
                              className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300/50 rounded-lg text-xs font-medium hover:from-emerald-200 hover:to-emerald-300 transition-all duration-300 transform hover:scale-105"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </button>
                            
                            <button
                              onClick={() => handleSendEmail(guest)}
                              className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50 rounded-lg text-xs font-medium hover:from-blue-200 hover:to-blue-300 transition-all duration-300 transform hover:scale-105"
                            >
                              <Mail className="h-3 w-3" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditGuest(guest)}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredGuests.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Aucun invité trouvé</p>
                <p className="text-slate-400">Essayez de modifier votre recherche</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/20 rounded-3xl shadow-luxury max-w-md w-full p-8 border border-amber-200/30 backdrop-blur-sm animate-slide-up relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-amber-200/20 to-purple-200/20 rounded-full blur-xl animate-float"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-rose-200/20 to-emerald-200/20 rounded-full blur-xl animate-bounce-slow"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                  {editingGuest ? 'Modifier l\'invité' : 'Ajouter un invité'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-6 w-6 text-slate-600" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitForm} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50/80 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Ex: Sophie Martin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Table
                  </label>
                  <select
                    value={guestFormData.tableNumber}
                    onChange={(e) => setGuestFormData({ ...guestFormData, tableNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white"
                    required
                  >
                    <option value="">Sélectionner une table</option>
                    {tables.length > 0 ? (
                      tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name} ({table.seats} places)
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Aucune table disponible, veuillez en créer dans Paramètres
                      </option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Statut
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'simple' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                        formData.status === 'simple'
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                          : 'border-slate-200 bg-neutral-50/50 text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      <UserCheck className="h-5 w-5" />
                      <span className="font-medium">Simple</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'couple' })}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${
                        formData.status === 'couple'
                          ? 'border-rose-500 bg-gradient-to-r from-rose-100 to-pink-200 text-rose-800'
                          : 'border-slate-200 bg-neutral-50/50 text-slate-600 hover:border-rose-300'
                      }`}
                    >
                      <Heart className="h-5 w-5" />
                      <span className="font-medium">Couple</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-neutral-100 text-slate-700 rounded-xl hover:bg-neutral-200 transition-all duration-300 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber hover:shadow-luxury transform hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                    {editingGuest ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatistics = () => {
    // Mock data for statistics
    const confirmedGuests = 4; // Mock: 4 out of 6 guests confirmed
    const confirmationRate = Math.round((confirmedGuests / guests.length) * 100);
    const totalInvitationsSent = guests.length;
    const guestbookMessages = 12; // Mock data
    
    // Mock beverage preferences
    const beveragePreferences = {
      champagne: 45,
      vin: 30,
      cocktail: 15,
      softs: 10
    };

    const statsCards = [
      {
        title: 'Taux de confirmation',
        value: `${confirmationRate}%`,
        subtitle: `${confirmedGuests}/${guests.length} confirmés`,
        icon: UserCheck,
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'from-emerald-100 to-emerald-200',
        textColor: 'text-emerald-800',
        shadowColor: 'shadow-lg'
      },
      {
        title: 'Invitations envoyées',
        value: totalInvitationsSent.toString(),
        subtitle: 'Total d\'invitations',
        icon: Mail,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'from-amber-100 to-amber-200',
        textColor: 'text-amber-800',
        shadowColor: 'shadow-glow-amber'
      },
      {
        title: 'Messages livre d\'or',
        value: guestbookMessages.toString(),
        subtitle: 'Messages reçus',
        icon: MessageCircle,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'from-purple-100 to-purple-200',
        textColor: 'text-purple-800',
        shadowColor: 'shadow-glow-purple'
      },
      {
        title: 'Préférence boisson',
        value: `${beveragePreferences.champagne}%`,
        subtitle: 'Champagne en tête',
        icon: Heart,
        color: 'from-rose-500 to-rose-600',
        bgColor: 'from-rose-100 to-rose-200',
        textColor: 'text-rose-800',
        shadowColor: 'shadow-glow-rose'
      }
    ];

    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-8">
          <div className="relative mr-4">
            <BarChart3 className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
            <div className="absolute inset-0 animate-pulse">
              <BarChart3 className="h-10 w-10 text-amber-300 opacity-30" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
            Statistiques de l'événement
          </h1>
        </div>
        
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {statsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className={`bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/20 rounded-3xl shadow-luxury hover:${card.shadowColor} transition-all duration-500 p-8 backdrop-blur-sm border border-amber-200/30 relative overflow-hidden transform hover:scale-105 animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-rose-200/10 to-emerald-200/10 rounded-full blur-xl animate-bounce-slow"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.bgColor} border border-opacity-50 backdrop-blur-sm`}>
                      <IconComponent className={`h-8 w-8 ${card.textColor} drop-shadow-sm`} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 font-medium">{card.title}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent mb-2">
                      {card.value}
                    </p>
                    <p className="text-slate-600 font-medium">{card.subtitle}</p>
                  </div>
                  
                  {/* Progress bar for confirmation rate */}
                  {card.title === 'Taux de confirmation' && (
                    <div className="mt-4">
                      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-glow-amber"
                          style={{ width: `${confirmationRate}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Beverage preferences breakdown */}
                  {card.title === 'Préférence boisson' && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(beveragePreferences).map(([beverage, percentage]) => (
                        <div key={beverage} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 capitalize">{beverage}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-neutral-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Additional Statistics Section */}
        <div className="bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 rounded-3xl shadow-luxury p-8 backdrop-blur-sm border border-amber-200/30 relative overflow-hidden mb-8">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-rose-200/10 to-emerald-200/10 rounded-full blur-2xl animate-bounce-slow"></div>
          
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent mb-6">
            Aperçu détaillé
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tables Overview */}
            <div className="bg-gradient-to-br from-amber-100/50 to-amber-200/30 rounded-2xl p-6 border border-amber-300/30 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-amber-800 mb-4">Répartition par tables</h4>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(tableNum => {
                  const tableGuests = guests.filter(guest => guest.table === tableNum);
                  const tablePeople = tableGuests.reduce((count, guest) => count + (guest.status === 'couple' ? 2 : 1), 0);
                  return (
                    <div key={tableNum} className="flex items-center justify-between">
                      <span className="text-amber-700 font-medium">Table {tableNum}</span>
                      <span className="text-amber-800 font-bold">{tablePeople} personnes</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Response Timeline */}
            <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 rounded-2xl p-6 border border-purple-300/30 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-purple-800 mb-4">Réponses récentes</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-700 text-sm">Sophie Martin - Confirmé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-purple-700 text-sm">Lucas Dubois - Confirmé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-purple-700 text-sm">Marie Leroy - En attente</span>
                </div>
              </div>
            </div>
            
            {/* Event Summary */}
            <div className="bg-gradient-to-br from-rose-100/50 to-rose-200/30 rounded-2xl p-6 border border-rose-300/30 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-rose-800 mb-4">Résumé de l'événement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-rose-700 font-medium">Date</span>
                  <span className="text-rose-800 font-bold">15 Juin 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-700 font-medium">Lieu</span>
                  <span className="text-rose-800 font-bold">Château Royal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-700 font-medium">Heure</span>
                  <span className="text-rose-800 font-bold">18h00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Filtre par table */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filtrer par table
              </label>
              <div className="relative">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-neutral-50 to-amber-50/30 border border-amber-200/50 rounded-xl px-4 py-3 pr-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-glow-amber backdrop-blur-sm min-w-[180px]"
                >
                  <option value="all">Toutes les tables</option>
                  <option value="table1">Table 1</option>
                  <option value="table2">Table 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-600 pointer-events-none" />
              </div>
            </div>

            {/* Filtre par période */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filtrer par période
              </label>
              <div className="relative">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="appearance-none bg-gradient-to-r from-neutral-50 to-amber-50/30 border border-amber-200/50 rounded-xl px-4 py-3 pr-10 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all duration-300 shadow-lg hover:shadow-glow-amber backdrop-blur-sm min-w-[180px]"
                >
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Bar Chart - Guest Status */}
          <div className="bg-gradient-to-br from-neutral-50 via-emerald-50/30 to-amber-50/20 rounded-3xl shadow-luxury p-8 backdrop-blur-sm border border-emerald-200/30 relative overflow-hidden animate-slide-up">
            {/* Background decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-r from-emerald-200/10 to-amber-200/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-r from-amber-200/10 to-emerald-200/10 rounded-full blur-xl animate-bounce-slow"></div>
            
            <div className="relative">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-slate-900 bg-clip-text text-transparent mb-6 flex items-center">
                <BarChart3 className="h-8 w-8 text-emerald-600 mr-3 drop-shadow-sm" />
                Statut des invitations
              </h3>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData.invitationStatus}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }}
                      axisLine={{ stroke: '#D1D5DB' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #F59E0B',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{ color: '#1F2937', fontWeight: '600' }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      fill="url(#barGradient)"
                    >
                      {filteredData.invitationStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Pie Chart - Beverage Preferences */}
          <div className="bg-gradient-to-br from-neutral-50 via-purple-50/30 to-rose-50/20 rounded-3xl shadow-luxury p-8 backdrop-blur-sm border border-purple-200/30 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Background decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-r from-purple-200/10 to-rose-200/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-r from-rose-200/10 to-purple-200/10 rounded-full blur-xl animate-bounce-slow"></div>
            
            <div className="relative">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-700 to-slate-900 bg-clip-text text-transparent mb-6 flex items-center">
                <Heart className="h-8 w-8 text-purple-600 mr-3 drop-shadow-sm" />
                Préférences de boissons
              </h3>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData.beveragePreferences}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {filteredData.beveragePreferences.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="rgba(255, 255, 255, 0.8)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #A855F7',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      labelStyle={{ color: '#1F2937', fontWeight: '600' }}
                      formatter={(value) => [`${value}%`, 'Pourcentage']}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#64748B'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-100/50 to-emerald-200/30 rounded-2xl p-6 border border-emerald-300/30 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-xl">
                <Check className="h-6 w-6 text-emerald-800" />
              </div>
              <span className="text-2xl font-bold text-emerald-800">67%</span>
            </div>
            <h4 className="text-emerald-800 font-semibold mb-1">Taux de confirmation</h4>
            <p className="text-emerald-700 text-sm">4 sur 6 invités</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-100/50 to-amber-200/30 rounded-2xl p-6 border border-amber-300/30 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-200 to-amber-300 rounded-xl">
                <Heart className="h-6 w-6 text-amber-800" />
              </div>
              <span className="text-2xl font-bold text-amber-800">40%</span>
            </div>
            <h4 className="text-amber-800 font-semibold mb-1">Boisson préférée</h4>
            <p className="text-amber-700 text-sm">Jus de fruits</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100/50 to-purple-200/30 rounded-2xl p-6 border border-purple-300/30 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-200 to-purple-300 rounded-xl">
                <Users className="h-6 w-6 text-purple-800" />
              </div>
              <span className="text-2xl font-bold text-purple-800">{Math.round((totalPeople / 8) * 100)}%</span>
            </div>
            <h4 className="text-purple-800 font-semibold mb-1">Capacité utilisée</h4>
            <p className="text-purple-700 text-sm">{totalPeople} sur 8 places</p>
          </div>
          
          <div className="bg-gradient-to-br from-rose-100/50 to-rose-200/30 rounded-2xl p-6 border border-rose-300/30 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-rose-200 to-rose-300 rounded-xl">
                <MessageCircle className="h-6 w-6 text-rose-800" />
              </div>
              <span className="text-2xl font-bold text-rose-800">12</span>
            </div>
            <h4 className="text-rose-800 font-semibold mb-1">Messages reçus</h4>
            <p className="text-rose-700 text-sm">Livre d'or</p>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="animate-fade-in">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Rapports et Analyses</h2>
            
            {/* Real-time counters */}
            <div className="flex space-x-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Wine className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Boissons choisies</p>
                    <p className="text-2xl font-bold text-amber-800">{drinkChoices.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200/50 shadow-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="text-sm text-rose-700 font-medium">Messages livre d'or</p>
                    <p className="text-2xl font-bold text-rose-800">{guestbookMessages.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Real-time interactions section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Drink choices table */}
            <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl shadow-luxury border border-amber-200/30 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
                <div className="flex items-center space-x-3">
                  <Wine className="h-6 w-6 text-slate-900" />
                  <h3 className="text-xl font-bold text-slate-900">Choix de Boissons</h3>
                  <div className="flex items-center space-x-1 ml-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-900 font-medium">En temps réel</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Nom invité</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Boisson</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Table</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Heure</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drinkChoices.map((choice, index) => (
                        <tr 
                          key={choice.id} 
                          className="border-b border-amber-100 hover:bg-amber-50/50 transition-colors duration-200"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-slate-900 text-sm font-semibold">
                                {choice.guestName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-slate-800 font-medium">{choice.guestName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              {choice.drink}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-700">{choice.table}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-1 text-slate-600 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{choice.timestamp}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Guestbook messages table */}
            <div className="bg-gradient-to-br from-neutral-50 to-rose-50/30 rounded-2xl shadow-luxury border border-rose-200/30 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6 text-slate-900" />
                  <h3 className="text-xl font-bold text-slate-900">Livre d'Or</h3>
                  <div className="flex items-center space-x-1 ml-auto">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-900 font-medium">En temps réel</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {guestbookMessages.map((message, index) => (
                    <div 
                      key={message.id} 
                      className="bg-gradient-to-br from-neutral-50 to-rose-50/20 rounded-xl p-4 border border-rose-100 hover:shadow-lg transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full flex items-center justify-center text-slate-900 text-sm font-semibold">
                            {message.guestName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-slate-800 font-semibold">{message.guestName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-500 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>{message.time}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed pl-10">{message.message}</p>
                      <div className="text-xs text-slate-500 mt-2 pl-10">{message.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Existing charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl shadow-luxury border border-amber-200/30 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Statut des invitations</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData.invitationStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-50 to-purple-50/30 rounded-2xl shadow-luxury border border-purple-200/30 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Préférences de boissons</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData.beveragePreferences}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {filteredData.beveragePreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeSection === 'invites') {
      return renderGuestManagement();
    }
    
    if (activeSection === 'statistiques') {
      return renderStatistics();
    }

    if (activeSection === 'rapports') {
      return renderReports();
    }

    if (activeSection === 'parametres') {
      return (
        <div className="animate-fade-in">
          <div className="flex items-center mb-8">
            <div className="relative mr-4">
              <Settings className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
              <div className="absolute inset-0 animate-pulse">
                <Settings className="h-10 w-10 text-amber-300 opacity-30" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
              Paramètres
            </h1>
          </div>

          <div className="space-y-8">
            {/* Gestion des Tables */}
            <div className="bg-gradient-to-br from-neutral-50 to-amber-50/30 rounded-2xl p-8 border border-neutral-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-amber-500 rounded-xl shadow-glow-amber mr-4">
                  <Table className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Tables d'Invités</h3>
                  <p className="text-slate-600">Gérez l'organisation des places</p>
                </div>
              </div>
              <TableManagement tables={tables} setTables={setTables} />
            </div>

            {/* Profil */}
            <div className="bg-gradient-to-br from-neutral-50 to-purple-50/30 rounded-2xl p-8 border border-neutral-200/50 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg mr-3">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Informations du Profil
              </h3>
              
              <div className="text-center relative">
                <div className="relative mx-auto mb-6 w-fit">
                  <Sparkles className="h-16 w-16 text-amber-500 animate-glow drop-shadow-lg" />
                  <div className="absolute inset-0 animate-pulse">
                    <Sparkles className="h-16 w-16 text-rose-400 opacity-30" />
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 bg-clip-text text-transparent mb-4">
                  Section à venir
                </h2>
                
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-neutral-50/50 rounded-xl p-6 border border-amber-200/20">
                  Cette section sera bientôt disponible avec toutes les fonctionnalités nécessaires pour gérer vos paramètres.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'personnalisation') {
      if (selectedTemplate) {
        return (
          <TemplateCustomization
            template={selectedTemplate}
            onBack={() => setSelectedTemplate(null)}
            onSave={(customizedTemplate) => {
              setSelectedTemplate(customizedTemplate);
              alert('Template sauvegardé avec succès !');
            }}
          />
        );
      } else {
        return (
          <div className="animate-fade-in">
            <div className="text-center py-16">
              <Palette className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-500 mb-2">Aucun template sélectionné</h3>
              <p className="text-neutral-400 mb-6">Sélectionnez un template depuis la page d'accueil pour commencer la personnalisation</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all duration-300 font-semibold"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        );
      }
    }
    
    const currentItem = menuItems.find(item => item.id === activeSection);
    const IconComponent = currentItem?.icon || Palette;
    
    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-8">
          <div className="relative mr-4">
            <IconComponent className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
            <div className="absolute inset-0 animate-pulse">
              <IconComponent className="h-10 w-10 text-amber-300 opacity-30" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
            {currentItem?.label}
          </h1>
        </div>
        
        <div className="bg-gradient-to-br from-neutral-50 via-amber-50/30 to-rose-50/20 rounded-3xl shadow-luxury p-8 md:p-12 backdrop-blur-sm border border-amber-200/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-amber-200/10 to-purple-200/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-rose-200/10 to-emerald-200/10 rounded-full blur-2xl animate-bounce-slow"></div>
          
          <div className="text-center relative">
            <div className="relative mx-auto mb-6 w-fit">
              <Sparkles className="h-16 w-16 text-amber-500 animate-glow drop-shadow-lg" />
              <div className="absolute inset-0 animate-pulse">
                <Sparkles className="h-16 w-16 text-rose-400 opacity-30" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 bg-clip-text text-transparent mb-4">
              Page {currentItem?.label} à venir
            </h2>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-neutral-50/50 rounded-xl p-6 border border-amber-200/20">
              Cette section sera bientôt disponible avec toutes les fonctionnalités nécessaires pour gérer vos invitations digitales élégantes.
            </p>
            
            <div className="mt-8">
              <button className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-900 px-8 py-4 rounded-full hover:from-amber-600 hover:via-amber-700 hover:to-amber-600 transition-all duration-500 font-semibold shadow-glow-amber hover:shadow-luxury transform hover:scale-105 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
                Bientôt disponible
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-purple-50/20 font-elegant">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-neutral-50 transform transition-transform duration-500 z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 shadow-luxury border-r border-amber-500/20`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Crown className="h-10 w-10 text-amber-500 drop-shadow-lg animate-glow" />
                <div className="absolute inset-0 animate-pulse">
                  <Crown className="h-10 w-10 text-amber-300 opacity-30" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-neutral-50 via-amber-200 to-neutral-50 bg-clip-text text-transparent">
                Furaha-Event
              </span>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-xl border border-amber-500/20 backdrop-blur-sm">
            <p className="text-sm text-amber-200">Bienvenue dans votre espace</p>
            <p className="text-lg font-semibold text-neutral-50">Dashboard</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 shadow-glow-amber' 
                    : 'hover:bg-slate-700/50 hover:border-amber-500/20 border border-transparent'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative">
                  <IconComponent className={`h-6 w-6 transition-colors duration-300 ${
                    isActive ? 'text-amber-400 drop-shadow-lg' : 'text-gray-300 group-hover:text-amber-400'
                  }`} />
                  {isActive && (
                    <div className="absolute inset-0 animate-pulse">
                      <IconComponent className="h-6 w-6 text-amber-300 opacity-30" />
                    </div>
                  )}
                </div>
                
                <span className={`font-medium transition-colors duration-300 ${
                  isActive ? 'text-neutral-50' : 'text-gray-300 group-hover:text-neutral-50'
                }`}>
                  {item.label}
                </span>
                
                <ChevronRight className={`h-5 w-5 ml-auto transition-all duration-300 ${
                  isActive 
                    ? 'text-amber-400 transform rotate-90' 
                    : 'text-gray-400 group-hover:text-amber-400 group-hover:translate-x-1'
                }`} />
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button className="w-full flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/30 hover:from-rose-500/30 hover:to-amber-500/30 transition-all duration-300 group shadow-glow-rose hover:shadow-luxury transform hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <LogOut className="h-6 w-6 text-rose-400 group-hover:text-rose-300 transition-colors duration-300" />
            <span className="font-medium text-neutral-50 group-hover:text-rose-100 transition-colors duration-300">
              Déconnexion
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-neutral-50/95 via-amber-50/90 to-neutral-50/95 backdrop-blur-xl shadow-luxury border-b border-amber-200/30 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-amber-100 rounded-lg transition-colors duration-300"
            >
              <Menu className="h-6 w-6 text-slate-900" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <p className="text-sm text-slate-600">Bienvenue,</p>
                <p className="font-semibold bg-gradient-to-r from-slate-900 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                  Utilisateur
                </p>
              </div>
              
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full flex items-center justify-center shadow-glow-amber">
                <span className="text-slate-900 font-bold">U</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;