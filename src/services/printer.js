export const printerService = {
    // ESC/POS Commands
    commands: {
        LF: '\x0A',
        ESC: '\x1B',
        GS: '\x1D',
    },

    formatInvoice(invoice) {
        // Simple text formatter for verification
        let text = `
    MY STORE
    Date: ${new Date(invoice.createdAt).toLocaleString()}
    Bill No: ${invoice.billNo}
    ------------------------
    Item        Qty    Price
    ------------------------
    `;

        invoice.items.forEach(item => {
            text += `${item.name.padEnd(12)} ${item.qty.toString().padEnd(4)} ${item.total.toFixed(2)}\n`;
        });

        text += `
    ------------------------
    Total:      ${invoice.grandTotal.toFixed(2)}
    Payment:    ${invoice.paymentMethod}
    
    Thank You!
    `;
        return text;
    },

    async print(invoice) {
        try {
            console.log('Printing Invoice:', invoice);
            const data = this.formatInvoice(invoice);

            // 1. Try Web Serial (Chrome Desktop)
            if ('serial' in navigator) {
                // This requires user gesture and permission, handled in UI component usually
                // For service, we just log capability.
                console.log('Web Serial API available');
            }

            // 2. Try Web Bluetooth (Chrome Mobile/Desktop)
            if ('bluetooth' in navigator) {
                console.log('Web Bluetooth API available');
            }

            // 3. Fallback: Browser Print
            // In a real PWA context, we might want to window.open a print text view
            // For this prototype, we'll assume a successful "sent to printer" status if APIs exist or fallback log.

            // Simulate hardware delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return true;
        } catch (error) {
            console.error('Print failed', error);
            throw error;
        }
    }
};
