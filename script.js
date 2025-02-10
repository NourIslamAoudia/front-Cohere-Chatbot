let isGenerating = false;
let intervalId = null;

async function sendMessage() {
    if (isGenerating) return; // Empêche l'envoi de nouveaux messages pendant la génération

    const input = document.getElementById('message-input');
    const messagesContainer = document.getElementById('chat-messages');
    const message = input.value.trim();

    if (!message) return;

    // Afficher le message de l'utilisateur
    messagesContainer.innerHTML += `
        <div class="message user-message">
            <strong>Vous:</strong> ${message}
        </div>
    `;

    input.value = ''; // Réinitialiser l'input
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll automatique

    // Activer le bouton "Stop" et désactiver le bouton "Envoyer"
    document.getElementById('stop-btn').classList.remove('hidden');
    document.getElementById('send-btn').disabled = true;
    isGenerating = true;

    // Ajouter une animation de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'ai-message', 'loading');
    loadingDiv.innerHTML = `<strong>IA:</strong> <span class="ai-text"><i class="fas fa-spinner fa-spin"></i> Génération en cours...</span>`;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll automatique

    try {
        const response = await fetch('https://cohere-chatbot.vercel.app/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const aiResponse = data.reply;

        // Supprimer l'animation de chargement
        loadingDiv.remove();

        // Afficher la réponse de l'IA mot par mot
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.classList.add('message', 'ai-message');
        aiMessageDiv.innerHTML = `<strong>IA:</strong> <span class="ai-text"></span>`;
        messagesContainer.appendChild(aiMessageDiv);

        let index = 0;
        intervalId = setInterval(() => {
            if (index < aiResponse.length) {
                aiMessageDiv.querySelector('.ai-text').textContent += aiResponse[index];
                index++;
                messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll automatique
            } else {
                clearInterval(intervalId);
                isGenerating = false;
                document.getElementById('stop-btn').classList.add('hidden');
                document.getElementById('send-btn').disabled = false;
            }
        }, 40); // Délai entre chaque mot (50ms)

    } catch (error) {
        console.error('Erreur:', error);
        isGenerating = false;
        document.getElementById('stop-btn').classList.add('hidden');
        document.getElementById('send-btn').disabled = false;
        loadingDiv.remove(); // Supprimer l'animation de chargement en cas d'erreur
    }
}

function stopGeneration() {
    if (intervalId) {
        clearInterval(intervalId);
        isGenerating = false;
        document.getElementById('stop-btn').classList.add('hidden');
        document.getElementById('send-btn').disabled = false;

        // Supprimer l'animation de chargement si elle est active
        const loadingDiv = document.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
}

// Fonction pour démarrer une nouvelle conversation
function startNewChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = ''; // Vider la zone de messages
    isGenerating = false; // Réinitialiser l'état de génération
    clearInterval(intervalId); // Arrêter toute génération en cours
    document.getElementById('stop-btn').classList.add('hidden'); // Cacher le bouton "Stop"
    document.getElementById('send-btn').disabled = false; // Réactiver le bouton "Envoyer"
}

// Ajouter un écouteur d'événement pour la touche "Entrer"
document.getElementById('message-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Empêcher le comportement par défaut (comme soumettre un formulaire)
        sendMessage(); // Appeler la fonction sendMessage
    }
});