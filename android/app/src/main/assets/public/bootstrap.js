// UltraBlabla - Point d'entrée principal
// Ce fichier charge la logique de l'assistant vocal

// Import du module principal
import('./js/webapp.js').then(() => {
    console.log('UltraBlabla assistant vocal chargé');
}).catch(err => {
    console.error('Erreur de chargement:', err);
});