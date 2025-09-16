import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Users, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';


const guestCount = (guest: Guest) => guest.etat === 'couple' ? 2 : 1;


interface Guest {
  id: string;
  nom: string;
  table: string;
  etat: 'simple' | 'couple';
  confirmed: boolean;
}

interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: any[];
}

interface GuestExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  tables: Table[];
}

const GuestExportModal = ({ isOpen, onClose, guests, tables }: GuestExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Fonction pour obtenir les invités par table
  const getGuestsByTable = (tableName: string) => {
    return guests.filter(guest => guest.table === tableName);
  };

  // Fonction pour obtenir toutes les tables avec invités
  const getTablesWithGuests = () => {
    const tablesWithGuests = [];
    
    // Ajouter les tables définies
    tables.forEach(table => {
      const tableGuests = getGuestsByTable(table.name);
      if (tableGuests.length > 0) {
        tablesWithGuests.push({
          name: table.name,
          guests: tableGuests,
          seats: table.seats
        });
      }
    });

    // Ajouter les invités sans table assignée
    const unassignedGuests = guests.filter(guest => 
      !guest.table || guest.table === '' || guest.table === 'Non assigné'
    );
    
    if (unassignedGuests.length > 0) {
      tablesWithGuests.push({
        name: 'Non assignés',
        guests: unassignedGuests,
        seats: 0
      });
    }

    return tablesWithGuests;
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Titre principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Invités par Table', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date de génération
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    const tablesWithGuests = getTablesWithGuests();
    const tablesToExport = selectedTable === 'all' 
      ? tablesWithGuests 
      : tablesWithGuests.filter(table => table.name === selectedTable);

    tablesToExport.forEach((table, tableIndex) => {
      // Vérifier si on a assez de place pour le titre de la table
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Titre de la table
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${table.name}`, 20, yPosition);
      
      // Informations de la table
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const occupiedSeats = table.guests.reduce((total, guest) => {
        return total + (guest.etat === 'couple' ? 2 : 1);
      }, 0);
      
      doc.text(`${table.guests.length} invité(s) - ${occupiedSeats} place(s) occupée(s)${table.seats > 0 ? ` / ${table.seats}` : ''}`, 20, yPosition + 10);
      yPosition += 25;

      // En-têtes du tableau
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Nom', 20, yPosition);
      doc.text('Type', 100, yPosition);
      doc.text('Places', 140, yPosition);
      doc.text('Statut', 170, yPosition);
      yPosition += 5;

      // Ligne de séparation
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Liste des invités
      doc.setFont('helvetica', 'normal');
      table.guests.forEach((guest, guestIndex) => {
        // Vérifier si on a assez de place
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(guest.nom, 20, yPosition);
        doc.text(guest.etat === 'couple' ? 'Couple' : 'Simple', 100, yPosition);
        doc.text(guest.etat === 'couple' ? '2' : '1', 140, yPosition);
        doc.text(guest.confirmed ? 'Confirmé' : 'En attente', 170, yPosition);
        yPosition += 15;
      });

      yPosition += 10;
    });

    // Résumé final
    if (selectedTable === 'all') {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Résumé Global', 20, yPosition);
      yPosition += 20;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
     const totalGuests = guests.reduce((sum, g) => sum + guestCount(g), 0);
const confirmedGuests = guests.reduce((sum, g) => sum + (g.confirmed ? guestCount(g) : 0), 0);


      doc.text(`Total invités: ${totalGuests}`, 20, yPosition);
      doc.text(`Invités confirmés: ${confirmedGuests}`, 20, yPosition + 15);
      doc.text(`Total places occupées: ${totalSeats}`, 20, yPosition + 30);
    }

    // Télécharger le PDF
    const fileName = selectedTable === 'all' 
      ? 'liste-invites-toutes-tables.pdf'
      : `liste-invites-${selectedTable.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    
    doc.save(fileName);
  };

  // Export Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const tablesWithGuests = getTablesWithGuests();
    const tablesToExport = selectedTable === 'all' 
      ? tablesWithGuests 
      : tablesWithGuests.filter(table => table.name === selectedTable);

    if (selectedTable === 'all') {
      // Créer une feuille par table
      tablesToExport.forEach(table => {
        const worksheetData = [
          [`Table: ${table.name}`],
          [`Invités: ${table.guests.length} - Places occupées: ${table.guests.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0)}${table.seats > 0 ? ` / ${table.seats}` : ''}`],
          [], // Ligne vide
          ['Nom', 'Type d\'invité', 'Places', 'Statut de confirmation'],
          ...table.guests.map(guest => [
            guest.nom,
            guest.etat === 'couple' ? 'Couple' : 'Simple',
            guest.etat === 'couple' ? 2 : 1,
            guest.confirmed ? 'Confirmé' : 'En attente'
          ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Ajuster la largeur des colonnes
        worksheet['!cols'] = [
          { width: 30 }, // Nom
          { width: 15 }, // Type
          { width: 10 }, // Places
          { width: 15 }  // Statut
        ];

        const sheetName = table.name.length > 31 ? table.name.substring(0, 31) : table.name;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Ajouter une feuille de résumé
      const summaryData = [
        ['Résumé Global'],
        [],
        ['Statistiques Générales'],
        ['Total invités', guests.reduce((sum, g) => sum + guestCount(g), 0)],
['Invités confirmés', guests.reduce((sum, g) => sum + (g.confirmed ? guestCount(g) : 0), 0)],
['Invités en attente', guests.reduce((sum, g) => sum + (!g.confirmed ? guestCount(g) : 0), 0)],
['Total places occupées', guests.reduce((sum, g) => sum + guestCount(g), 0)],
        [],
        ['Répartition par Table'],
        ['Nom de la table', 'Nombre d\'invités', 'Places occupées', 'Places disponibles'],
        ...tablesWithGuests.map(table => [
          table.name,
          table.guests.length,
          table.guests.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0),
          table.seats > 0 ? table.seats - table.guests.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0) : 'N/A'
        ])
      ];

      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [
        { width: 25 },
        { width: 15 },
        { width: 15 },
        { width: 15 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Résumé');
    } else {
      // Une seule feuille pour la table sélectionnée
      const table = tablesToExport[0];
      const worksheetData = [
        [`Liste des Invités - ${table.name}`],
        [`Généré le ${new Date().toLocaleDateString('fr-FR')}`],
        [],
        [`Informations de la table:`],
        [`Nombre d'invités: ${table.guests.length}`],
        [`Places occupées: ${table.guests.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0)}${table.seats > 0 ? ` / ${table.seats}` : ''}`],
        [],
        ['Nom', 'Type d\'invité', 'Places', 'Statut de confirmation'],
        ...table.guests.map(guest => [
          guest.nom,
          guest.etat === 'couple' ? 'Couple' : 'Simple',
          guest.etat === 'couple' ? 2 : 1,
          guest.confirmed ? 'Confirmé' : 'En attente'
        ])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = [
        { width: 30 },
        { width: 15 },
        { width: 10 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invités');
    }

    // Télécharger le fichier Excel
    const fileName = selectedTable === 'all' 
      ? 'liste-invites-toutes-tables.xlsx'
      : `liste-invites-${selectedTable.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (selectedFormat === 'pdf') {
        exportToPDF();
      } else {
        exportToExcel();
      }
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
    }
  };

  const tablesWithGuests = getTablesWithGuests();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-luxury max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50 to-amber-50/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative mr-3">
                <Download className="h-6 w-6 text-amber-500 animate-glow drop-shadow-lg" />
                <div className="absolute inset-0 animate-pulse">
                  <Download className="h-6 w-6 text-amber-300 opacity-30" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Exporter les Invités
                </h2>
                <p className="text-slate-600 text-sm">
                  Téléchargez la liste par table
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Sélection du format */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Format d'export
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedFormat === 'pdf'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-neutral-200 hover:border-amber-300 text-slate-600'
                  }`}
                >
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">PDF</div>
                  <div className="text-xs opacity-75">Document imprimable</div>
                </button>

                <button
                  onClick={() => setSelectedFormat('excel')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedFormat === 'excel'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 hover:border-emerald-300 text-slate-600'
                  }`}
                >
                  <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-sm font-medium">Excel</div>
                  <div className="text-xs opacity-75">Feuille de calcul</div>
                </button>
              </div>
            </div>

            {/* Sélection de la table */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Table à exporter
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
              >
                <option value="all">Toutes les tables</option>
                {tablesWithGuests.map((table) => (
                  <option key={table.name} value={table.name}>
                    {table.name} ({table.guests.length} invité{table.guests.length > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Aperçu des données */}
            <div className="bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-xl p-4 border border-neutral-200/50">
              <div className="flex items-center mb-3">
                <Users className="h-4 w-4 text-amber-600 mr-2" />
                <h3 className="text-sm font-semibold text-slate-900">Aperçu de l'export</h3>
              </div>
              
              {selectedTable === 'all' ? (
                <div className="space-y-2 text-sm text-slate-600">
                  <div>• {tablesWithGuests.length} table{tablesWithGuests.length > 1 ? 's' : ''}</div>
                  <div>
  • {guests.reduce((sum, g) => sum + guestCount(g), 0)} invité
  {guests.reduce((sum, g) => sum + guestCount(g), 0) > 1 ? 's' : ''} au total
</div>
                  <div>
  • {guests.reduce((sum, g) => sum + (g.confirmed ? guestCount(g) : 0), 0)} confirmé
  {guests.reduce((sum, g) => sum + (g.confirmed ? guestCount(g) : 0), 0) > 1 ? 's' : ''}
</div>
                </div>
              ) : (
                (() => {
                  const selectedTableData = tablesWithGuests.find(t => t.name === selectedTable);
                  return selectedTableData ? (
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>• Table: {selectedTableData.name}</div>
                      <div>• {selectedTableData.guests.length} invité{selectedTableData.guests.length > 1 ? 's' : ''}</div>
                      <div>• {selectedTableData.guests.filter(g => g.confirmed).length} confirmé{selectedTableData.guests.filter(g => g.confirmed).length > 1 ? 's' : ''}</div>
                    </div>
                  ) : null;
                })()
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || tablesWithGuests.length === 0}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-glow-amber transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestExportModal;