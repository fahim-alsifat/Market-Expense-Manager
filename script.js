// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Budget elements
    const budgetInput = document.getElementById('budget');
    const setBudgetBtn = document.getElementById('setBudget');
    const totalBudgetEl = document.getElementById('totalBudget');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const remainingCashEl = document.getElementById('remainingCash');

    // Expense form elements
    const expenseForm = document.getElementById('expenseForm');
    const storeNameInput = document.getElementById('storeNameInput');
    const priceInput = document.getElementById('priceInput');
    const quantityInput = document.getElementById('quantityInput');
    const itemNameInput = document.getElementById('itemNameInput');
    const categoryInput = document.getElementById('categoryInput');
    const resetButton = document.getElementById('resetButton');
    const storeNames = document.getElementById('storeNames');
    
    // Expense table element
    const expenseTableBody = document.getElementById('expenseTableBody');
    
    // App state
    let state = {
        budget: 0,
        expenses: [],
        stores: []
    };
    
    // Load data from localStorage if available
    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('marketExpenseState');
        if (savedState) {
            state = JSON.parse(savedState);
            updateUI();
            populateStoresList();
        }
    }
    
    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('marketExpenseState', JSON.stringify(state));
    }
    
    // Update UI with current state
    function updateUI() {
        totalBudgetEl.textContent = formatCurrency(state.budget);
        
        const totalExpenses = calculateTotalExpenses();
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
        
        const remainingCash = state.budget - totalExpenses;
        remainingCashEl.textContent = formatCurrency(remainingCash);
        
        // Update remaining cash color based on value
        if (remainingCash < 0) {
            remainingCashEl.style.color = '#e74c3c';
        } else {
            remainingCashEl.style.color = 'white';
        }
        
        // Render expense table
        renderExpenseTable();
    }
    
    // Format currency values
    function formatCurrency(value) {
        return '৳ ' + value.toFixed(2);
    }
    
    // Calculate total expenses
    function calculateTotalExpenses() {
        return state.expenses.reduce((total, expense) => {
            return total + (expense.price * expense.quantity);
        }, 0);
    }
    
    // Completely clear all store data from dropdown and localStorage
    function clearAllStoreData() {
        state.stores = [];
        storeNames.innerHTML = '';
    }
    
    // Populate stores datalist
    function populateStoresList() {
        storeNames.innerHTML = '';
        state.stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store;
            storeNames.appendChild(option);
        });
    }
    
    // Add store to stores list if not already there
    function addStoreToList(store) {
        if (store && !state.stores.includes(store)) {
            state.stores.push(store);
            populateStoresList();
        }
    }
    
    // Render expense table
    function renderExpenseTable() {
        expenseTableBody.innerHTML = '';
        
        state.expenses.forEach((expense, index) => {
            const row = document.createElement('tr');
            
            const totalPrice = expense.price * expense.quantity;
            
            row.innerHTML = `
                <td>${expense.store || '-'}</td>
                <td>${expense.itemName || '-'}</td>
                <td>${expense.category || '-'}</td>
                <td>${formatCurrency(expense.price)}</td>
                <td>${expense.quantity}</td>
                <td>${formatCurrency(totalPrice)}</td>
                <td>
                    <button class="action-btn delete-expense" data-index="${index}">❌</button>
                </td>
            `;
            
            expenseTableBody.appendChild(row);
        });
        
        // Add "Clear All" button if there are expenses
        if (state.expenses.length > 0) {
            const clearAllRow = document.createElement('tr');
            clearAllRow.innerHTML = `
                <td colspan="7" style="text-align: center;">
                    <button id="clearAllBtn" class="btn secondary">Clear All Expenses</button>
                </td>
            `;
            expenseTableBody.appendChild(clearAllRow);
            
            // Add event listener to the Clear All button
            document.getElementById('clearAllBtn').addEventListener('click', clearAllExpenses);
        }
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-expense').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteExpense(index);
            });
        });
    }
    
    // Delete expense
    function deleteExpense(index) {
        state.expenses.splice(index, 1);
        
        // If all expenses are deleted, clear the stores array
        if (state.expenses.length === 0) {
            clearAllStoreData();
        }
        
        saveToLocalStorage();
        updateUI();
    }
    
    // Clear all expenses and store data
    function clearAllExpenses() {
        if (confirm('Are you sure you want to delete all expenses? This will also clear all store data.')) {
            state.expenses = [];
            clearAllStoreData();
            saveToLocalStorage();
            updateUI();
        }
    }
    
    // Set budget event handler
    setBudgetBtn.addEventListener('click', () => {
        const budgetValue = parseFloat(budgetInput.value);
        if (!isNaN(budgetValue) && budgetValue >= 0) {
            state.budget = budgetValue;
            saveToLocalStorage();
            updateUI();
            budgetInput.value = '';
        } else {
            alert('Please enter a valid budget amount');
        }
    });
    
    // Add expense event handler
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const price = parseFloat(priceInput.value);
        const quantity = parseInt(quantityInput.value) || 1;
        
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }
        
        const expense = {
            store: storeNameInput.value.trim(),
            itemName: itemNameInput.value.trim(),
            category: categoryInput.value,
            price: price,
            quantity: quantity
        };
        
        // Add store to list if provided
        addStoreToList(expense.store);
        
        // Add expense to state
        state.expenses.push(expense);
        saveToLocalStorage();
        updateUI();
        
        // Reset form
        expenseForm.reset();
        quantityInput.value = '1';
    });
    
    // Reset button event handler
    resetButton.addEventListener('click', () => {
        expenseForm.reset();
        quantityInput.value = '1';
    });
    
    // Initialize app
    loadFromLocalStorage();
}); 