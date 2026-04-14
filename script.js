const expenseForm = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const totalValue = document.getElementById("total-value");
const expenseCount = document.getElementById("expense-count");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit-button");
const formMessage = document.getElementById("form-message");

const expenses = [];
let editingIndex = null;

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function setFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message";

    if (type) {
        formMessage.classList.add(type);
    }
}

function updateSummary() {
    const total = expenses.reduce(function (sum, expense) {
        return sum + expense.amount;
    }, 0);

    totalValue.textContent = formatCurrency(total);
    expenseCount.textContent =
        expenses.length === 1 ? "1 gasto cadastrado" : expenses.length + " gastos cadastrados";
}

function resetFormState() {
    expenseForm.reset();
    editingIndex = null;
    submitButton.textContent = "Adicionar gasto";
    cancelEditButton.hidden = true;
    descriptionInput.focus();
}

function startEditExpense(index) {
    const expense = expenses[index];

    if (!expense) {
        return;
    }

    editingIndex = index;
    descriptionInput.value = expense.description;
    amountInput.value = expense.amount.toFixed(2);
    categoryInput.value = expense.category;
    submitButton.textContent = "Salvar alteracao";
    cancelEditButton.hidden = false;
    setFormMessage("Modo de edicao ativado. Atualize os campos e salve.", "warning");
    descriptionInput.focus();
}

function renderExpenses() {
    if (expenses.length === 0) {
        expenseList.innerHTML = `
            <tr class="empty-row">
                <td colspan="4">Nenhum gasto cadastrado ainda.</td>
            </tr>
        `;
        return;
    }

    expenseList.innerHTML = expenses
        .map(function (expense, index) {
            const isHighValue = expense.amount > 100;
            const warningTag = isHighValue ? '<span class="warning-tag">Alerta</span>' : "";
            const rowClass = isHighValue ? "high-value" : "";

            return `
                <tr class="${rowClass}" data-index="${index}">
                    <td>${escapeHtml(expense.description)} ${warningTag}</td>
                    <td><span class="expense-category">${escapeHtml(expense.category)}</span></td>
                    <td>${formatCurrency(expense.amount)}</td>
                    <td>
                        <div class="table-actions">
                            <button
                                type="button"
                                class="action-button action-button--edit"
                                data-action="edit"
                                data-index="${index}"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                class="action-button action-button--delete"
                                data-action="delete"
                                data-index="${index}"
                            >
                                Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function saveExpense(event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!description || !category || Number.isNaN(amount) || amount <= 0) {
        setFormMessage("Preencha todos os campos com dados validos.", "error");
        return;
    }

    const expenseData = {
        description: description,
        amount: amount,
        category: category
    };

    if (editingIndex === null) {
        expenses.push(expenseData);
        setFormMessage("Gasto adicionado com sucesso.", "success");
    } else {
        expenses[editingIndex] = expenseData;
        setFormMessage("Gasto atualizado com sucesso.", "success");
    }

    renderExpenses();
    updateSummary();
    resetFormState();
}

function deleteExpense(index) {
    if (!expenses[index]) {
        return;
    }

    expenses.splice(index, 1);

    if (editingIndex === index) {
        resetFormState();
    } else if (editingIndex !== null && index < editingIndex) {
        editingIndex -= 1;
    }

    renderExpenses();
    updateSummary();
    setFormMessage("Gasto removido com sucesso.", "success");
}

expenseForm.addEventListener("submit", saveExpense);

cancelEditButton.addEventListener("click", function () {
    resetFormState();
    setFormMessage("Edicao cancelada.", "warning");
});

expenseList.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-action]");

    if (actionButton) {
        const index = Number(actionButton.dataset.index);
        const action = actionButton.dataset.action;

        if (action === "edit") {
            startEditExpense(index);
        }

        if (action === "delete") {
            deleteExpense(index);
        }

        return;
    }

    const clickedRow = event.target.closest("tr[data-index]");

    if (clickedRow) {
        startEditExpense(Number(clickedRow.dataset.index));
    }
});

renderExpenses();
updateSummary();
