class FormValidator {
    constructor() {
        this.form = document.getElementById('validationForm');
        this.fields = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword')
        };
        this.submitBtn = document.querySelector('.submit-btn');
        this.init();
    }

    init() {
        // Add event listeners
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.addEventListener('blur', () => this.validateField(fieldName));
            field.addEventListener('input', () => this.clearValidation(fieldName));

            if (fieldName === 'password') {
                field.addEventListener('input', () => this.checkPasswordStrength());
            }
            if (fieldName === 'confirmPassword') {
                field.addEventListener('input', () => this.validatePasswordMatch());
            }
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = false;
        let errorMessage = '';

        switch (fieldName) {
            case 'fullName':
                if (value.length === 0) {
                    errorMessage = 'Full name is required';
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    errorMessage = 'Name should only contain letters and spaces';
                } else {
                    isValid = true;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value.length === 0) {
                    errorMessage = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                } else {
                    isValid = true;
                }
                break;

            case 'phone':
                const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
                if (value.length === 0) {
                    errorMessage = 'Phone number is required';
                } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                    errorMessage = 'Please enter a valid phone number';
                } else {
                    isValid = true;
                }
                break;

            case 'password':
                if (value.length === 0) {
                    errorMessage = 'Password is required';
                } else if (value.length < 8) {
                    errorMessage = 'Password must be at least 8 characters';
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    errorMessage = 'Password must contain uppercase, lowercase, and number';
                } else {
                    isValid = true;
                }
                break;

            case 'confirmPassword':
                if (value.length === 0) {
                    errorMessage = 'Please confirm your password';
                } else if (value !== this.fields.password.value) {
                    errorMessage = 'Passwords do not match';
                } else {
                    isValid = true;
                }
                break;
        }

        this.showValidationResult(field, isValid, errorMessage);
        this.updateSubmitButton();
        return isValid;
    }

    showValidationResult(field, isValid, errorMessage) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        const successDiv = field.parentNode.querySelector('.success-message');

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            errorDiv.classList.remove('show');
            successDiv.classList.add('show');
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            errorDiv.querySelector('.text').textContent = errorMessage;
            errorDiv.classList.add('show');
            successDiv.classList.remove('show');
        }
    }

    clearValidation(fieldName) {
        const field = this.fields[fieldName];
        field.classList.remove('valid', 'invalid');
        const errorDiv = field.parentNode.querySelector('.error-message');
        const successDiv = field.parentNode.querySelector('.success-message');
        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');
    }

    checkPasswordStrength() {
        const password = this.fields.password.value;
        const strengthContainer = document.querySelector('.password-strength');
        const strengthFill = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (password.length === 0) {
            strengthContainer.style.display = 'none';
            return;
        }

        strengthContainer.style.display = 'block';

        let strength = 0;
        let strengthLabel = '';

        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Character variety
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        // Remove all strength classes
        strengthFill.className = 'strength-fill';

        if (strength <= 2) {
            strengthFill.classList.add('strength-weak');
            strengthLabel = 'Weak';
            strengthText.style.color = '#dc3545';
        } else if (strength <= 3) {
            strengthFill.classList.add('strength-fair');
            strengthLabel = 'Fair';
            strengthText.style.color = '#ffc107';
        } else if (strength <= 4) {
            strengthFill.classList.add('strength-good');
            strengthLabel = 'Good';
            strengthText.style.color = '#17a2b8';
        } else {
            strengthFill.classList.add('strength-strong');
            strengthLabel = 'Strong';
            strengthText.style.color = '#28a745';
        }

        strengthText.textContent = `Password strength: ${strengthLabel}`;
    }

    validatePasswordMatch() {
        if (this.fields.confirmPassword.value.length > 0) {
            this.validateField('confirmPassword');
        }
    }

    updateSubmitButton() {
        const allValid = Object.keys(this.fields).every(fieldName => {
            return this.fields[fieldName].classList.contains('valid');
        });

        this.submitBtn.disabled = !allValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        let allValid = true;
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                allValid = false;
            }
        });

        if (!allValid) {
            return;
        }

        // Show loading
        const btnText = this.submitBtn.querySelector('.btn-text');
        const loading = this.submitBtn.querySelector('.loading');

        btnText.style.display = 'none';
        loading.style.display = 'block';
        this.submitBtn.disabled = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Hide loading
        btnText.style.display = 'block';
        loading.style.display = 'none';

        // Show success popup
        this.showSuccessPopup();

        // Reset form
        setTimeout(() => {
            this.resetForm();
        }, 2000);
    }

    showSuccessPopup() {
        const popup = document.getElementById('successPopup');
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }

    resetForm() {
        this.form.reset();
        Object.keys(this.fields).forEach(fieldName => {
            this.clearValidation(fieldName);
        });
        document.querySelector('.password-strength').style.display = 'none';
        this.submitBtn.disabled = true;
    }
}

// Initialize the form validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});