import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Table {
  id: number;
  name: string;
  seats: number;
  assignedGuests: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class TablesAPI {
  static async createTable(
    userId: string, 
    tableData: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<APIResponse<string>> {
    try {
      const tableId = `table_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      console.log('Création de la table avec ID:', tableId, 'pour l\'utilisateur:', userId);
      
      const table: Table = {
        id: parseInt(tableId.replace(/\D/g, '')) || Date.now(),
        ...tableData,
        assignedGuests: tableData.assignedGuests || [],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const tableRef = doc(db, 'users', userId, 'Tables', tableId);
      await setDoc(tableRef, table);
      
      console.log('Table créée avec succès:', tableId);
      return { success: true, data: tableId };
    } catch (error) {
      console.error('Erreur lors de la création de la table:', error);
      return { 
        success: false, 
        error: 'Impossible de créer la table' 
      };
    }
  }

  static async getUserTables(userId: string): Promise<APIResponse<Table[]>> {
    try {
      console.log('Chargement des tables pour l\'utilisateur:', userId);
      const tablesRef = collection(db, 'users', userId, 'Tables');
      const querySnapshot = await getDocs(tablesRef);
      
      const tables: Table[] = [];
      querySnapshot.forEach((doc) => {
        console.log('Table trouvée:', doc.id, doc.data());
        tables.push({
          id: doc.data().id || parseInt(doc.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
          ...doc.data()
        } as Table);
      });
      
      const sortedTables = tables.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      console.log('Total tables chargées:', sortedTables.length);
      return { success: true, data: sortedTables };
    } catch (error) {
      console.error('Erreur lors de la récupération des tables:', error);
      return { 
        success: false, 
        error: 'Impossible de récupérer les tables' 
      };
    }
  }

  static async updateTable(
    userId: string,
    tableId: string,
    updates: Partial<Table>
  ): Promise<APIResponse<void>> {
    try {
      const tableRef = doc(db, 'users', userId, 'Tables', tableId);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(tableRef, updateData);
      console.log('Table mise à jour:', tableId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la table:', error);
      return { 
        success: false, 
        error: 'Impossible de mettre à jour la table' 
      };
    }
  }

  static async deleteTable(userId: string, tableId: string): Promise<APIResponse<void>> {
    try {
      const tableRef = doc(db, 'users', userId, 'Tables', tableId);
      await deleteDoc(tableRef);
      
      console.log('Table supprimée:', tableId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la table:', error);
      return { 
        success: false, 
        error: 'Impossible de supprimer la table' 
      };
    }
  }
}