const display = document.getElementById('result');
const expressionEl = document.getElementById('expression');

let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

function updateDisplay() {
  display.textContent = formatNumber(currentInput);
}

function formatNumber(value) {
  if (value === 'Error') return value;

  // Don't format while user is still typing a decimal
  if (value.endsWith('.')) return value;

  const num = parseFloat(value);
  if (isNaN(num)) return '0';

  // Limit display length — use exponential notation for very large/small numbers
  if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
    return num.toExponential(4);
  }

  // Show up to 10 significant digits
  const formatted = parseFloat(num.toPrecision(10));
  return formatted.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

function updateExpression() {
  if (operator && previousInput) {
    const opSymbol = { '/': '÷', '*': '×', '-': '−', '+': '+' }[operator];
    expressionEl.textContent = `${formatNumber(previousInput)} ${opSymbol}`;
  } else {
    expressionEl.textContent = '';
  }
}

function inputNumber(value) {
  if (currentInput === 'Error') currentInput = '0';

  if (shouldResetDisplay) {
    currentInput = value;
    shouldResetDisplay = false;
  } else if (currentInput === '0' && value !== '0') {
    currentInput = value;
  } else if (currentInput === '0' && value === '0') {
    // Do nothing — keep single zero
  } else if (currentInput.replace(/[^0-9]/g, '').length < 12) {
    currentInput += value;
  }
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetDisplay) {
    currentInput = '0.';
    shouldResetDisplay = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function handleOperator(op) {
  const current = parseFloat(currentInput);

  if (operator && !shouldResetDisplay) {
    // Chain operations: evaluate the pending operation first
    const result = calculate(parseFloat(previousInput), current, operator);
    currentInput = String(result);
    updateDisplay();
  }

  previousInput = currentInput;
  operator = op;
  shouldResetDisplay = true;
  updateExpression();
  highlightActiveOp(op);
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? 'Error' : a / b;
    default: return b;
  }
}

function handleEquals() {
  if (!operator || previousInput === '') return;

  const a = parseFloat(previousInput);
  const b = parseFloat(currentInput);

  expressionEl.textContent = `${formatNumber(previousInput)} ${
    { '/': '÷', '*': '×', '-': '−', '+': '+' }[operator]
  } ${formatNumber(currentInput)} =`;

  const result = calculate(a, b, operator);
  currentInput = String(result);
  previousInput = '';
  operator = null;
  shouldResetDisplay = true;

  updateDisplay();
  clearActiveOp();
}

function handleClear() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  shouldResetDisplay = false;
  updateDisplay();
  updateExpression();
  clearActiveOp();
}

function handleToggleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = String(parseFloat(currentInput) * -1);
  updateDisplay();
}

function handlePercent() {
  if (currentInput === 'Error') return;
  currentInput = String(parseFloat(currentInput) / 100);
  updateDisplay();
}

function highlightActiveOp(op) {
  clearActiveOp();
  const btn = document.querySelector(`[data-value="${op}"].btn-op`);
  if (btn) btn.classList.add('active');
}

function clearActiveOp() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active'));
}

// Button click handler
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'number':
      inputNumber(value);
      clearActiveOp();
      break;
    case 'decimal':
      inputDecimal();
      clearActiveOp();
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'equals':
      handleEquals();
      break;
    case 'clear':
      handleClear();
      break;
    case 'toggle-sign':
      handleToggleSign();
      break;
    case 'percent':
      handlePercent();
      break;
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputNumber(e.key);
    clearActiveOp();
  } else if (e.key === '.') {
    inputDecimal();
    clearActiveOp();
  } else if (['+', '-', '*', '/'].includes(e.key)) {
    handleOperator(e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    handleEquals();
  } else if (e.key === 'Escape') {
    handleClear();
  } else if (e.key === 'Backspace') {
    if (currentInput.length > 1 && currentInput !== 'Error') {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  } else if (e.key === '%') {
    handlePercent();
  }
});

updateDisplay();
