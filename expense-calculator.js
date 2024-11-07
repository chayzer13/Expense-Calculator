class ExpenseCalculator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.state = {
            expenses: [],
            total: 0
        };

        this.proxyState = new Proxy(this.state, {
            set: (target, property, value) => {
                target[property] = value;
                this.render();
                return true;
            }
        });

        this.render();
    }

    addExpense(name, amount) {
        this.proxyState.expenses.push({ name, amount, isEditing: false, details: [] });
        this.calculateTotal();
    }

    removeExpense(index) {
        this.proxyState.expenses.splice(index, 1);
        this.calculateTotal();
    }

    editExpense(index) {
        this.proxyState.expenses = this.proxyState.expenses.map((expense, i) =>
            i === index ? { ...expense, isEditing: true } : expense
        );
    }

    saveExpense(index, newName, newAmount) {
        this.proxyState.expenses[index] = {
            ...this.proxyState.expenses[index],
            name: newName,
            amount: parseFloat(newAmount),
            isEditing: false
        };
        this.calculateTotal();
    }

    addDetailToExpense(index, detailName, detailAmount) {
        const expense = this.proxyState.expenses[index];
        expense.details.push({ detailName, detailAmount, isEditing: false });
        expense.amount += parseFloat(detailAmount);
        this.calculateTotal();
    }

    editDetail(index, detailIndex) {
        const expense = this.proxyState.expenses[index];
        expense.details = expense.details.map((detail, i) =>
            i === detailIndex ? { ...detail, isEditing: true } : detail
        );
        this.calculateTotal();
    }

    saveDetail(index, detailIndex, newDetailName, newDetailAmount) {
        const expense = this.proxyState.expenses[index];
        expense.details[detailIndex] = {
            detailName: newDetailName,
            detailAmount: parseFloat(newDetailAmount),
            isEditing: false
        };
        expense.amount = expense.details.reduce((sum, detail) => sum + detail.detailAmount, 0);
        this.calculateTotal();
    }

    removeDetail(index, detailIndex) {
        const expense = this.proxyState.expenses[index];
        expense.details.splice(detailIndex, 1);
        this.calculateTotal();
    }

    calculateTotal() {
        this.proxyState.total = this.proxyState.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
    }

    render() {
        this.shadowRoot.innerHTML = `
<style>
* {
    box-sizing: border-box;
}

    .expense-calculator {
        font-family: Arial, sans-serif;
        width: 100%;
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 12px;
        background: #343a40;
        color: #f8f9fa;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h3 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 2em;
        font-weight: bold;
        color: #f8f9fa;
    }

    .expense-name, .expense-amount {
        margin: 10px 0;
        width: 100%;
        max-width: 500px;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #6c757d;
        font-size: 1.2em;
        background: #495057;
        color: #f8f9fa;
        transition: background 0.3s;
    }

    .expense-name::placeholder, .expense-amount::placeholder {
        color: #adb5bd;
    }

    .expense-name:focus, .expense-amount:focus {
        outline: none;
        border-color: #28a745;
    }

    button {
        margin: 8px 0;
        padding: 10px;
        font-size: 1.1em;
        width: 100%;
        max-width: 500px;
        border-radius: 8px;
        border: none;
        background: #007bff;
        color: #fff;
        cursor: pointer;
        transition: background 0.3s, transform 0.2s, box-shadow 0.3s;
    }

    button:hover {
        background-color: #0056b3;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    button.add {
        background: #28a745;
    }

    button.add:hover {
        background: #218838;
    }

    button.edit {
        background: #17a2b8;
        font-size: 0.8em;
        padding: 6px 12px;
    }

    button.edit:hover {
        background: #138496;
    }

    button.remove {
        background: #dc3545;
        font-size: 0.8em;
        padding: 6px 12px;
    }

    button.remove:hover {
        background: #c82333;
    }

    .expense-list {
        width: 100%;
    }

    .expense-item {
        background: #495057;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .expense-header {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 10px;
    }

    .expense-header span {
        font-size: 1.3em;
        font-weight: bold;
        margin-bottom: 5px;
    }

.details-list {
    width: 100%;
    padding: 0;
    margin-top: 10px;
}

.detail-item {
    display: flex;
    justify-content: space-between; 
    align-items: center; 
    font-size: 0.9em;
    margin-bottom: 8px;
    width: 100%; 
    box-sizing: border-box; 
}

    .editDetailName, .editDetailAmount {
        width: 100%;
        padding: 12px;
        font-size: 1.1em;
        margin: 8px 0;
        border-radius: 8px;
        border: 1px solid #6c757d;
        background: #495057;
        color: #f8f9fa;
    }

    .editDetailName:focus, .editDetailAmount:focus {
        outline: none;
        border-color: #28a745;
    }

    .total {
        text-align: center;
        font-weight: bold;
        font-size: 1.5em;
        margin-top: 20px;
        color: #28a745;
    }


    .buttons-container {
        display: flex;
        justify-content: space-between; 
        align-items: center;
        width: 100%;
        max-width: 400px;
    }

.details-list button {
    width: auto; 
    height: 35px;
    padding: 5px 10px; 
    font-size: 0.9em;
    margin-left: 10px; 
}

.details-list .remove-detail button {
    margin-left: 10px;
}
    .add-detail-container {
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        align-items: center;
    }

    .add-detail-container input {
        margin-bottom: 10px;
        max-width: 200px;
    }

    .add-detail-container button {
        max-width: 200px;
    }
</style>
            <div class="expense-calculator">
                <h3>Калькулятор расходов</h3>
                <input type="text" id="expenseName" class="expense-name" placeholder="Название расхода" />
                <input type="number" id="expenseAmount" class="expense-amount" placeholder="Сумма" />
                <button class="add" id="addButton">Добавить расход</button>
                <div class="expense-list">
                    ${this.proxyState.expenses.map((expense, index) => `
                        <div class="expense-item">
                            ${expense.isEditing ? `
                                <div class="expense-header">
                                    <input type="text" class="editName" data-index="${index}" value="${expense.name}" />
                                    <input type="number" class="editAmount" data-index="${index}" value="${expense.amount}" />
                                    <button class="save" data-index="${index}">Сохранить</button>
                                </div>
                            ` : `
                                <div class="expense-header">
                                    <span>${expense.name}: ${expense.amount} ₽</span>
                                    <button class="edit" data-index="${index}">Редактировать</button>
                                    <button class="remove" data-index="${index}">Удалить</button>
                                </div>
                                <div class="details-list">
                                    ${expense.details.map((detail, detailIndex) => `
                                        <div class="detail-item">
                                            ${detail.isEditing ? `
                                                <input type="text" class="editDetailName" data-index="${index}" data-detail-index="${detailIndex}" value="${detail.detailName}" />
                                                <input type="number" class="editDetailAmount" data-index="${index}" data-detail-index="${detailIndex}" value="${detail.detailAmount}" />
                                                <button class="save-detail" data-index="${index}" data-detail-index="${detailIndex}">Сохранить</button>
                                            ` : `
                                                <span>– ${detail.detailName}: ${detail.detailAmount} ₽</span>
                                                <button class="edit-detail" data-index="${index}" data-detail-index="${detailIndex}">Редактировать</button>
                                                <button class="remove-detail" data-index="${index}" data-detail-index="${detailIndex}">Удалить</button>
                                            `}
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-detail-container">
                                    <input type="text" class="detailName" data-index="${index}" placeholder="Подкатегория (напр. Хлеб)" />
                                    <input type="number" class="detailAmount" data-index="${index}" placeholder="Цена" />
                                    <button class="add-detail" data-index="${index}">Добавить деталь</button>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
                <div class="total">Общая сумма: ${this.proxyState.total} ₽</div>
            </div>
        `;

        this.shadowRoot.getElementById('addButton').onclick = () => {
            const name = this.shadowRoot.getElementById('expenseName').value;
            const amount = parseFloat(this.shadowRoot.getElementById('expenseAmount').value);
            if (name && !isNaN(amount)) {
                this.addExpense(name, amount);
                this.shadowRoot.getElementById('expenseName').value = '';
                this.shadowRoot.getElementById('expenseAmount').value = '';
            }
        };

        this.shadowRoot.querySelectorAll('.edit').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.editExpense(index);
            };
        });

        this.shadowRoot.querySelectorAll('.save').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                const newName = this.shadowRoot.querySelector(`.editName[data-index="${index}"]`).value;
                const newAmount = parseFloat(this.shadowRoot.querySelector(`.editAmount[data-index="${index}"]`).value);
                if (newName && !isNaN(newAmount)) {
                    this.saveExpense(index, newName, newAmount);
                }
            };
        });

        this.shadowRoot.querySelectorAll('.remove').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                this.removeExpense(index);
            };
        });

        this.shadowRoot.querySelectorAll('.add-detail').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                const detailName = this.shadowRoot.querySelector(`.detailName[data-index="${index}"]`).value;
                const detailAmount = parseFloat(this.shadowRoot.querySelector(`.detailAmount[data-index="${index}"]`).value);
                if (detailName && !isNaN(detailAmount)) {
                    this.addDetailToExpense(index, detailName, detailAmount);
                    this.shadowRoot.querySelector(`.detailName[data-index="${index}"]`).value = '';
                    this.shadowRoot.querySelector(`.detailAmount[data-index="${index}"]`).value = '';
                }
            };
        });

        this.shadowRoot.querySelectorAll('.edit-detail').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                const detailIndex = parseInt(button.getAttribute('data-detail-index'));
                this.editDetail(index, detailIndex);
            };
        });

        this.shadowRoot.querySelectorAll('.save-detail').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                const detailIndex = parseInt(button.getAttribute('data-detail-index'));
                const newDetailName = this.shadowRoot.querySelector(`.editDetailName[data-index="${index}"][data-detail-index="${detailIndex}"]`).value;
                const newDetailAmount = parseFloat(this.shadowRoot.querySelector(`.editDetailAmount[data-index="${index}"][data-detail-index="${detailIndex}"]`).value);
                if (newDetailName && !isNaN(newDetailAmount)) {
                    this.saveDetail(index, detailIndex, newDetailName, newDetailAmount);
                }
            };
        });

        this.shadowRoot.querySelectorAll('.remove-detail').forEach(button => {
            button.onclick = () => {
                const index = parseInt(button.getAttribute('data-index'));
                const detailIndex = parseInt(button.getAttribute('data-detail-index'));
                this.removeDetail(index, detailIndex);
            };
        });
    }
}

customElements.define('expense-calculator', ExpenseCalculator);
