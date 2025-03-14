import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class IdeaService {
  constructor(private firestore: Firestore) {}

  // 🔹 Ajouter une idée à Firestore sous l'utilisateur connecté
  async addIdea(uid: string, idea: any): Promise<void> {
    const ideasRef = collection(this.firestore, `users/${uid}/ideas`);
    await addDoc(ideasRef, idea);
  }

  // 🔹 Récupérer toutes les idées d'un utilisateur
  async getIdeas(uid: string): Promise<any[]> {
    const ideasRef = collection(this.firestore, `users/${uid}/ideas`);
    const querySnapshot = await getDocs(ideasRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // 🔹 Supprimer une idée par son ID
  async deleteIdea(uid: string, ideaId: string): Promise<void> {
    const ideaRef = doc(this.firestore, `users/${uid}/ideas/${ideaId}`);
    await deleteDoc(ideaRef);
  }
}