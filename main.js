const title = document.getElementById("title");
const price = document.getElementById("price");
const taxes = document.getElementById("taxes");
const ads = document.getElementById("ads");
const descount = document.getElementById("descount");
const total = document.getElementById("total");
const count = document.getElementById("count");
const category = document.getElementById("category");
const create = document.getElementById("create");
const productForm = document.getElementById("productForm");

let mood = "create";
let temp;
let items = JSON.parse(localStorage.getItem("localitems")) || [];

const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
};

const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const validateInputs = () => {
    if (!title.value.trim()) {
        showNotification('Please enter a product title', 'error');
        return false;
    }
    if (!price.value || parseFloat(price.value) <= 0) {
        showNotification('Please enter a valid price', 'error');
        return false;
    }
    if (count.value && (parseInt(count.value) < 1 || parseInt(count.value) > 100)) {
        showNotification('Quantity must be between 1 and 100', 'error');
        return false;
    }
    return true;
};

function getTotal() {
    if (price.value) {
        const result = (
            parseFloat(price.value || 0) +
            parseFloat(taxes.value || 0) +
            parseFloat(ads.value || 0)
        ) - parseFloat(descount.value || 0);
        
        total.textContent = formatCurrency(result);
        total.style.backgroundColor = result >= 0 ? '#27ae60' : '#e74c3c';
    } else {
        total.textContent = '0.00';
        total.style.backgroundColor = '#ecf0f1';
    }
}

create.onclick = function() {
    if (!validateInputs()) return;

    const itemsList = {
        title: title.value.toLowerCase().trim(),
        price: formatCurrency(price.value),
        taxes: formatCurrency(taxes.value || 0),
        ads: formatCurrency(ads.value || 0),
        descount: formatCurrency(descount.value || 0),
        total: total.textContent,
        count: count.value || 1,
        category: category.value.toLowerCase().trim(),
        createdAt: new Date().toISOString()
    };

    try {
        if (mood === "create") {
            if (itemsList.count > 1) {
                for (let i = 0; i < itemsList.count; i++) {
                    items.push({...itemsList, id: Date.now() + i});
                }
            } else {
                items.push({...itemsList, id: Date.now()});
            }
            showNotification('Product created successfully', 'success');
        } else {
            items[temp] = {...itemsList, id: items[temp].id};
            count.style.display = "block";
            create.innerHTML = '<i class="fas fa-plus"></i> Create Product';
            mood = "create";
            showNotification('Product updated successfully', 'success');
            clearInput();
        }

        localStorage.setItem("localitems", JSON.stringify(items));
        showItems();
    } catch (error) {
        showNotification('An error occurred while saving the product', 'error');
        console.error('Error:', error);
    }
};

function clearInput() {
    productForm.reset();
    total.textContent = '0.00';
    total.style.backgroundColor = '#ecf0f1';
    count.style.display = "block";
    create.innerHTML = '<i class="fas fa-plus"></i> Create Product';
    mood = "create";
}

function showItems() {
    const tbody = document.getElementById('tbody');
    let tableRow = '';

    items.forEach((item, index) => {
        tableRow += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>$${item.price}</td>
                <td>$${item.taxes}</td>
                <td>$${item.ads}</td>
                <td>$${item.descount}</td>
                <td>$${item.total}</td>
                <td>${item.category}</td>
                <td>
                    <button onclick="updateItem(${index})" class="btn-secondary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteItem(${index})" class="btn-secondary">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = tableRow;
    
    const deleteAllBtn = document.getElementById("deleteAll");
    if (items.length > 0) {
        deleteAllBtn.innerHTML = `
            <button onclick="deleteAll()" class="btn-secondary">
                <i class="fas fa-trash"></i> Delete All (${items.length})
            </button>
        `;
    } else {
        deleteAllBtn.innerHTML = '';
    }
}

function deleteItem(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        items.splice(index, 1);
        localStorage.setItem("localitems", JSON.stringify(items));
        showItems();
        showNotification('Product deleted successfully', 'success');
    }
}

function deleteAll() {
    if (confirm('Are you sure you want to delete all products? This action cannot be undone.')) {
        localStorage.clear();
        items = [];
        showItems();
        showNotification('All products have been deleted', 'success');
    }
}

function updateItem(index) {
    const item = items[index];
    title.value = item.title;
    price.value = item.price;
    taxes.value = item.taxes;
    ads.value = item.ads;
    descount.value = item.descount;
    category.value = item.category;
    getTotal();
    count.style.display = "none";
    create.innerHTML = '<i class="fas fa-save"></i> Update Product';
    mood = "update";
    temp = index;
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

let searchMood = "title";

function getMood(id) {
    const search = document.getElementById("search");
    searchMood = id === "seartitle" ? "title" : "category";
    search.placeholder = `Search by ${searchMood}`;
    search.focus();
    search.value = "";
    showItems();
}

function searchMethod(value) {
    const searchValue = value.toLowerCase();
    const filteredItems = items.filter(item => 
        searchMood === "title" 
            ? item.title.includes(searchValue)
            : item.category.includes(searchValue)
    );

    const tbody = document.getElementById('tbody');
    let tableRow = '';

    filteredItems.forEach((item, index) => {
        tableRow += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.title}</td>
                <td>$${item.price}</td>
                <td>$${item.taxes}</td>
                <td>$${item.ads}</td>
                <td>$${item.descount}</td>
                <td>$${item.total}</td>
                <td>${item.category}</td>
                <td>
                    <button onclick="updateItem(${items.indexOf(item)})" class="btn-secondary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteItem(${items.indexOf(item)})" class="btn-secondary">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = tableRow;
}

showItems();