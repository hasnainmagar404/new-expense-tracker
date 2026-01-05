export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date))
}

export function formatDateForInput(date) {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}

export function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[monthIndex]
}

export function getCurrentMonthYear() {
    const now = new Date()
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    }
}
