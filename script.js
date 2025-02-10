let isGenerating = false;
let intervalId = null;

async function sendMessage() {
    if (isGenerating) return; // Empêche l'envoi de nouveaux messages pendant la génération

    const input = document.getElementById('message-input');
    const messagesContainer = document.getElementById('chat-messages');
    const message = input.value.trim();

    if (!message) return;

    // Afficher le message de l'utilisateur
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `<strong>Vous:</strong> ${message}`;
    messagesContainer.appendChild(userMessageDiv);

    input.value = ''; // Réinitialiser l'input
    scrollToBottom();

    // Désactiver le bouton "Envoyer" et afficher "Stop"
    toggleButtons(true);

    // Ajouter une animation de chargement
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'ai-message', 'loading');
    loadingDiv.innerHTML = `<strong>IA:</strong> <span class="ai-text"><i class="fas fa-spinner fa-spin"></i> Génération...</span>`;
    messagesContainer.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const response = await fetch('https://cohere-chatbot.vercel.app/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const aiResponse = data.reply || "Désolé, je n'ai pas pu comprendre votre demande.";

        // Supprimer l'animation de chargement
        loadingDiv.remove();

        // Afficher la réponse de l'IA lettre par lettre
        displayAIMessage(aiResponse);
    } catch (error) {
        console.error('Erreur:', error);
        loadingDiv.remove(); // Supprimer l'animation de chargement en cas d'erreur
        toggleButtons(false);
    }
}

// Fonction pour afficher le message IA de manière progressive
function displayAIMessage(aiResponse) {
    const messagesContainer = document.getElementById('chat-messages');
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.classList.add('message', 'ai-message');
    aiMessageDiv.innerHTML = `<strong>IA:</strong> <span class="ai-text"></span>`;
    messagesContainer.appendChild(aiMessageDiv);
    scrollToBottom();

    let index = 0;
    intervalId = setInterval(() => {
        if (index < aiResponse.length) {
            aiMessageDiv.querySelector('.ai-text').textContent += aiResponse[index];
            index++;
            scrollToBottom();
        } else {
            clearInterval(intervalId);
            toggleButtons(false);
        }
    }, getTypingSpeed(aiResponse.length));
}

// Fonction pour adapter la vitesse d'affichage selon la longueur du message
function getTypingSpeed(length) {
    return length > 100 ? 20 : 40; // Plus le message est long, plus il s'affiche rapidement
}

// Fonction pour arrêter la génération du texte
function stopGeneration() {
    if (intervalId) {
        clearInterval(intervalId);
        toggleButtons(false);
    }
}

// Fonction pour vider la conversation et réinitialiser l'état
function startNewChat() {
    document.getElementById('chat-messages').innerHTML = '';
    stopGeneration();
}

// Fonction pour gérer l'affichage des boutons
function toggleButtons(isDisabled) {
    document.getElementById('send-btn').disabled = isDisabled;
    document.getElementById('stop-btn').classList.toggle('hidden', !isDisabled);
}

// Fonction pour scroller automatiquement en bas
function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Écouteur d'événement pour envoyer un message en appuyant sur "Enter"
document.getElementById('message-input').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
