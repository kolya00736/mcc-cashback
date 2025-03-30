// Retrieve shops from localStorage or return an empty array.
function getShops() {
    const data = localStorage.getItem("shops");
    return data ? JSON.parse(data) : [];
}

// Save shops to localStorage.
function setShops(data) {
    localStorage.setItem("shops", JSON.stringify(data));
}

// Render the table with the shops data.
function renderTable() {
    const shops = getShops();
    const tbody = document.querySelector("#shopsTable tbody");
    const theadRow = document.querySelector('#shopsTable thead tr');

    tbody.innerHTML = "";

    shops.forEach((shop, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${shop.name}</td>
        <td>${shop.mcc}</td>
        <td>
            <button onclick="deleteShop(${index})">Удалить</button>
        </td>
        `;
        tbody.appendChild(tr);
    });

    updateDeleteAllButton(shops.length, theadRow);
}

// Delete a shop by its index.
function deleteShop(index) {
    const shops = getShops();
    shops.splice(index, 1);
    setShops(shops);
    renderTable();
}

// Add a new shop from the input fields.
document.getElementById("addShop").addEventListener("click", () => {
    const nameInput = document.getElementById("shopName");
    const mccInput = document.getElementById("shopMcc");
    const name = nameInput.value.trim();
    const mcc = mccInput.value.trim();

    if (name === "" || mcc === "") {
        alert("Please fill out both fields.");
        return;
    }

    const shops = getShops();
    // Check for duplicates by name and mcc.
    const exists = shops.some(
        (shop) => shop.name === name && shop.mcc === mcc
    );
    if (exists) {
        alert("Shop already exists.");
        return;
    }
    shops.push({ name, mcc });

    setShops(shops);
    renderTable();

    nameInput.value = "";
    mccInput.value = "";
});

// Import shops from a JSON file when a file is selected.
document.getElementById("uploadFile").addEventListener("change", function (e) {
    const fileInput = e.target; // Reference to the input element
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) {
                alert("Неверный формат файла!");
                return;
            }

            if (importedData.length === 0) {
                alert("Загруженный файл не содержит ни одного магазина");
                return;
            }

            const currentData = getShops();
            // Add each imported shop only if it doesn't exist already.
            importedData.forEach((importedShop) => {
                const exists = currentData.some(
                    (shop) =>
                        shop.name === importedShop.name && shop.mcc === importedShop.mcc
                );
                if (!exists) {
                    currentData.push(importedShop);
                }
            });

            setShops(currentData);
            renderTable(); // Update UI before showing the alert
            setTimeout(() => alert("Магазины успешно импортированы"), 5);
        } catch (error) {
            alert("Ошибка при чтении файла: " + error.message);
        }
    };

    reader.readAsText(file);
    fileInput.value = '';
});

// Export the current shops data to a JSON file.
document.getElementById('exportButton').addEventListener('click', function () {
    const shops = getShops();
    if (shops.length === 0) {
        alert('Текущий список магазинов пуст');
        return;
    }
    const dataStr = JSON.stringify(shops, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shops.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

function updateDeleteAllButton(shopCount, theadRow) {
    let deleteAllButton = document.getElementById('deleteAllShops');

    if (shopCount > 0) {
        if (!deleteAllButton) {
            // Create column with the delete button
            const actionsHeader = document.createElement('th');
            const deleteAllButton = document.createElement('button');

            deleteAllButton.id = 'deleteAllShops';
            deleteAllButton.textContent = 'Удалить все';
            deleteAllButton.style.margin = '0';

            deleteAllButton.addEventListener('click', function () {
                if (confirm("Вы уверены, что хотите очистить весь список магазинов?")) {
                    localStorage.removeItem('shops');
                    renderTable();
                }
            });

            actionsHeader.appendChild(deleteAllButton);
            theadRow.appendChild(actionsHeader);
        }
    } else {
        // If no shops exist, remove the entire column
        if (deleteAllButton) {
            deleteAllButton.parentElement.remove(); // Removes the <th> containing the button
        }
    }
}

// Initialize the table on page load.
renderTable();