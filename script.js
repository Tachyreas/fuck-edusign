async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('File not found');
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("Initial classrooms.json not found or error parsing. Awaiting manual upload.");
    return [];
  }
}

let classrooms = await fetchData("classrooms.json");

const searchInput = document.getElementById('roomSearch');
const searchResults = document.getElementById('searchResults');
const qrcodeContainer = document.getElementById('qrcodeContainer');
const jsonFileInput = document.getElementById('jsonFile');
let selectedRoom = null;

// Gestion du chargement du fichier JSON
jsonFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            classrooms = data;
            alert(`✅ ${classrooms.length} salles chargées avec succès !`);
            searchInput.value = '';
            searchResults.innerHTML = '';
            qrcodeContainer.innerHTML = '';
            searchInput.focus();
        } catch (error) {
            alert('❌ Erreur lors du chargement du fichier JSON. Vérifiez le format.');
            console.error(error);
        }
    };
    reader.readAsText(file);
});

export function selectRoom(name, url, event) {
    selectedRoom = { name, url };
    
    // Update selected state
    document.querySelectorAll('.result-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Use the passed event to find the clicked item
    if (event && event.target) {
        event.target.closest('.result-item').classList.add('selected');
    }

    generateQRCode(name, url);
}

function searchRooms(query) {
    if (!query.trim()) {
        searchResults.innerHTML = '';
        qrcodeContainer.innerHTML = '';
        return;
    }

    const filtered = classrooms.filter(room => 
        room.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p class="mb-0">Aucune salle trouvée pour "${query}"</p>
            </div>
        `;
        qrcodeContainer.innerHTML = '';
        return;
    }

    // Clear previous results and append the new ones
    searchResults.innerHTML = '';
    searchResults.appendChild(renderSearchResults(filtered));
}

function renderSearchResults(filtered) {
    const container = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'mb-3';

    const count = filtered.length;
    const badge = document.createElement('span');
    badge.className = 'badge bg-primary';
    badge.textContent = `${count} salle${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''}`;

    header.appendChild(badge);
    container.appendChild(header);

    filtered.forEach(room => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';

        // Pass the event object to selectRoom
        itemDiv.onclick = (e) => selectRoom(room.name, room.url, e);

        const strongName = document.createElement('strong');
        strongName.textContent = `Salle ${room.name}`;

        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'float-end';
        arrowSpan.textContent = '→';

        itemDiv.appendChild(strongName);
        itemDiv.appendChild(arrowSpan);
        container.appendChild(itemDiv);
    });

    return container;
}

function generateQRCode(name, url) {
    qrcodeContainer.innerHTML = `
        <div class="qr-container">
            <h4 class="mb-3">
                Salle ${name}
            </h4>
            <div id="qrcode"></div>
            <div class="mt-3">
                <a href="${url}" target="_blank" class="btn btn-outline-primary">
                    Ouvrir le lien
                </a>
            </div>
        </div>
    `;

    new QRCode(document.getElementById('qrcode'), {
        text: url,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

searchInput.addEventListener('input', (e) => {
    searchRooms(e.target.value);
});

// Mise au point sur le champ de recherche au chargement
searchInput.focus();
