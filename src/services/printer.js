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

            // Create a hidden iframe for printing
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;

            // Generate Receipt HTML
            // Note: Thermal printers usually use 58mm or 80mm width.
            // We use a safe max-width and monospace font.
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>Print Receipt</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            width: 300px; /* Approx 80mm */
                            font-size: 12px;
                            margin: 0;
                            padding: 10px;
                        }
                        .header { text-align: center; margin-bottom: 10px; }
                        .divider { border-top: 1px dashed black; margin: 5px 0; }
                        .item-row { display: flex; justify-content: space-between; }
                        .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-top: 5px; }
                        .footer { text-align: center; margin-top: 15px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2 style="margin:0;">MY STORE</h2>
                        <div>Bill No: ${invoice.billNo}</div>
                        <div>Date: ${new Date(invoice.createdAt).toLocaleString()}</div>
                    </div>

                    <div class="divider"></div>

                    ${invoice.items.map(item => `
                        <div class="item-row">
                            <span style="flex:2">${item.name}</span>
                            <span style="flex:1; text-align:right">x${item.qty}</span>
                            <span style="flex:1; text-align:right">${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}

                    <div class="divider"></div>

                    <div class="total-row">
                        <span>Total:</span>
                        <span>${invoice.grandTotal.toFixed(2)}</span>
                    </div>
                    <div class="item-row">
                        <span>Payment:</span>
                        <span>${invoice.paymentMethod}</span>
                    </div>

                    <div class="footer">
                        Thank You!
                    </div>
                </body>
                </html>
            `);
            doc.close();

            // Wait for content to load then print
            const printPromise = new Promise((resolve) => {
                iframe.contentWindow.onload = () => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    // Remove iframe after printing (give it a small delay for mobile)
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        resolve(true);
                    }, 1000);
                };
            });

            // Fallback if onload doesn't fire immediately (e.g. already loaded)
            if (doc.readyState === 'complete') {
                iframe.contentWindow.print();
                setTimeout(() => {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                }, 1000);
                return true;
            }

            return await printPromise;

        } catch (error) {
            console.error('Print failed', error);
            throw error;
        }
    }
};
