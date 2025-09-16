
onst summaryData = [
        ['Résumé Global'],
        [],
        ['Statistiques Générales'],
        ['Total invités', guests.length],
        ['Invités confirmés', guests.filter(g => g.confirmed).length],
        ['Invités en attente', guests.filter(g => !g.confirmed).length],
        ['Total places occupées', guests.reduce((total, guest) => total + (guest.etat === 'couple' ? 2 : 1), 0)],
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
                  <div>• {guests.length} invité{guests.length > 1 ? 's' : ''} au total</div>
                  <div>• {guests.filter(g => g.confirmed).length} confirmé{guests.filter(g => g.confirmed).length > 1 ? 's' : ''}</div>
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