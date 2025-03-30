const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search');

// Create additional headers based on banks data
const additionalHeaders = Object.keys(banks);
additionalHeaders.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    document.querySelector('thead tr').appendChild(th);
});

function getShopsData() {
    const data = localStorage.getItem('shops');
    return data ? JSON.parse(data) : []; // Default to empty array if no data exists
}

// Helper function to create a row for a given shopData object
function createRow(shopData) {
    const row = document.createElement('tr');

    // Column 1: Shop Name
    const nameCell = document.createElement('td');
    nameCell.textContent = shopData.name;
    row.appendChild(nameCell);

    // Column 2: MCC (and optional mccMir)
    const numbersCell = document.createElement('td');
    numbersCell.textContent = shopData.mcc;
    if (shopData.hasOwnProperty('mccMir')) {
        numbersCell.textContent += ' (' + shopData.mccMir + ' МИР)';
    }
    row.appendChild(numbersCell);

    // Additional columns based on banks data
    additionalHeaders.forEach(header => {
        const cell = document.createElement('td');
        cell.style.fontStyle = "italic";
        const banksItems = banks[header];

        // Create an array of the shop's MCC codes
        const shopMccCodes = [shopData.mcc];
        if (shopData.hasOwnProperty('mccMir')) {
            shopMccCodes.push(shopData.mccMir);
        }

        // Get matching bank items (each item has a property `mcc` which is an array of codes)
        const matchingItems = banksItems.filter(item =>
            item.mcc.some(code => shopMccCodes.includes(code))
        );

        // If matches are found, create separate blocks in the cell for each
        if (matchingItems.length > 0) {
            matchingItems.forEach((item, index) => {
                const block = document.createElement('div');
                block.textContent = item.name;
                // Add a line (border) between blocks if there are multiple matches
                if (index !== matchingItems.length - 1) {
                    block.style.borderBottom = "1px solid #ccc";
                }
                block.style.padding = "2px 0";
                cell.appendChild(block);
            });
        } else {
            cell.textContent = '✘';
        }
        row.appendChild(cell);
    });

    return row;
}

// Function to render the table with a given array of shops
function renderTable(shops) {
    tableBody.innerHTML = '';
    shops.forEach(shopData => {
        tableBody.appendChild(createRow(shopData));
    });
}

// Initially render all shops
renderTable(getShopsData());

// Listen for input changes in the search field
searchInput.addEventListener('input', function (e) {
    const searchTerm = e.target.value.trim().replaceAll(',', ' ').replaceAll(' ', '');
    const shops = getShopsData();

    // If the search input is empty, show all shops
    if (searchTerm === '') {
        renderTable(shops);
        return;
    }

    // If the search term is numeric (i.e. an MCC code)
    if (/^\d+$/.test(searchTerm)) {
        // Filter shops that have an exact MCC or mccMir match
        const filtered = shops.filter(shop =>
            shop.mcc === searchTerm || shop.mccMir === searchTerm
        );

        // Only build a custom dummy row if the search term is exactly 4 digits
        // and no shop with that MCC was found.
        if (searchTerm.length === 4 && filtered.length === 0) {
            const dummyShop = { name: "MCC " + searchTerm, mcc: searchTerm };
            renderTable([dummyShop]);
        } else {
            renderTable(filtered);
        }
    } else {
        // Otherwise, filter shops by name (case-insensitive)
        const filtered = shops.filter(shop =>
            shop.name.toLowerCase().replaceAll(' ', '').includes(searchTerm.toLowerCase())
        );
        renderTable(filtered);
    }
});