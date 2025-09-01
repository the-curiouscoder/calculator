class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.history = '';
        
        this.display = document.getElementById('current');
        this.historyDisplay = document.getElementById('history');
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        const calculator = document.querySelector('.calculator');
        
        // Handle button clicks
        calculator.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn')) return;
            
            this.addButtonEffect(e.target);
            
            if (e.target.dataset.number !== undefined) {
                this.inputNumber(e.target.dataset.number);
            } else if (e.target.dataset.operator) {
                this.inputOperator(e.target.dataset.operator);
            } else if (e.target.dataset.action) {
                this.performAction(e.target.dataset.action);
            }
        });
        
        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }
    
    addButtonEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    handleKeyboardInput(e) {
        const key = e.key;
        
        // Prevent default for calculator keys
        if (/[0-9+\-*/=.]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            e.preventDefault();
        }
        
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        } else if (key === '.') {
            this.performAction('decimal');
        } else if (key === '+') {
            this.inputOperator('+');
        } else if (key === '-') {
            this.inputOperator('-');
        } else if (key === '*') {
            this.inputOperator('×');
        } else if (key === '/') {
            this.inputOperator('÷');
        } else if (key === '=' || key === 'Enter') {
            this.performAction('calculate');
        } else if (key === 'Escape') {
            this.performAction('clear');
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (key === '%') {
            this.performAction('percent');
        }
    }
    
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.previousInput = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateHistory();
    }
    
    performAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'calculate':
                this.performCalculation();
                break;
            case 'sign':
                this.toggleSign();
                break;
            case 'percent':
                this.percentage();
                break;
        }
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.history = '';
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
        
        this.updateDisplay();
    }
    
    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.charAt(0) === '-' 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
        this.updateDisplay();
    }
    
    percentage() {
        const value = parseFloat(this.currentInput) / 100;
        this.currentInput = `${value}`;
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    performCalculation() {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.previousInput !== '' && this.operator && !this.waitingForOperand) {
            const currentValue = this.previousInput || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operator);
            
            this.history = `${this.previousInput} ${this.operator} ${inputValue} =`;
            this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
            this.previousInput = '';
            this.operator = '';
            this.waitingForOperand = true;
            this.updateDisplay();
        }
    }
    
    calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+':
                return firstOperand + secondOperand;
            case '-':
                return firstOperand - secondOperand;
            case '×':
                return firstOperand * secondOperand;
            case '÷':
                return secondOperand !== 0 ? firstOperand / secondOperand : 0;
            default:
                return secondOperand;
        }
    }
    
    updateHistory() {
        this.history = `${this.previousInput} ${this.operator}`;
        this.historyDisplay.textContent = this.history;
    }
    
    updateDisplay() {
        // Format large numbers with commas
        const formattedNumber = this.formatNumber(this.currentInput);
        this.display.textContent = formattedNumber;
        this.historyDisplay.textContent = this.history;
        
        // Adjust font size for long numbers
        this.adjustFontSize();
    }
    
    formatNumber(num) {
        const number = parseFloat(num);
        
        if (isNaN(number)) return '0';
        
        // Handle very large or very small numbers
        if (Math.abs(number) >= 1e10 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format with commas for readability
        return number.toLocaleString('en-US', {
            maximumFractionDigits: 8,
            useGrouping: true
        });
    }
    
    adjustFontSize() {
        const displayText = this.display.textContent;
        const displayWidth = this.display.clientWidth;
        
        // Reset font size
        this.display.style.fontSize = '2.5rem';
        
        // Check if text overflows
        if (this.display.scrollWidth > displayWidth) {
            if (displayText.length > 12) {
                this.display.style.fontSize = '1.8rem';
            } else if (displayText.length > 8) {
                this.display.style.fontSize = '2rem';
            }
        }
    }
} 

// Enhanced user experience features
class UIEnhancements {
    constructor() {
        this.addRippleEffect();
        this.addThemeToggle();
        this.addTooltips();
    }
    
    addRippleEffect() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
        
        // Add ripple styles
        const style = document.createElement('style');
        style.textContent = `
            .btn {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    addThemeToggle() {
        // Automatically adjust to system theme preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        }
        
        // Listen for theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        });
    }
    
    addTooltips() {
        const tooltips = {
            'AC': 'Clear all (Esc)',
            '±': 'Toggle sign',
            '%': 'Percentage',
            '=': 'Calculate (Enter)',
            '.': 'Decimal point'
        };
        
        document.querySelectorAll('.btn').forEach(btn => {
            const text = btn.textContent;
            if (tooltips[text]) {
                btn.title = tooltips[text];
            }
        });
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    new UIEnhancements();
    
    // Add loading animation
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.6s ease-out';
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
});