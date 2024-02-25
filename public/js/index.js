document.addEventListener('DOMContentLoaded', function () {
    const fetchUrl = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies';
    const baseCurrency = 'usd';
    const currenciesToCompare = ['clp', 'ars', 'pen', 'cop', 'usdt', 'eur', 'gbp', 'jpy', 'cad', 'aud'];

    const fetchPromises = currenciesToCompare.map(currency => {
        const url = `${fetchUrl}/${baseCurrency.toLowerCase()}/${currency}.json`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching data for ${currency}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const { date, ...currencies } = data;
                const currencyDataArray = Object.entries(currencies).map(([currency, value]) => ({
                    date,
                    currency,
                    value
                }));
                return currencyDataArray;
            })
            .catch(error => {
                console.error(`Error fetching data for ${currency}:`, error);
                return null;
            });
    });

    Promise.all(fetchPromises)
        .then(arrayOfCurrencyDataArrays => {
            const currencyDataArray = [].concat(...arrayOfCurrencyDataArrays);
            const currencyTableBody = document.getElementById('currencyTableBody');
            currencyDataArray.forEach(currencyData => {
                if (currencyData) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="text-center">${currencyData.currency.toUpperCase()}</td>
                        <td class="text-center">${currencyData.value.toFixed(3)}</td>
                    `;
                    currencyTableBody.appendChild(row);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching data for currencies:', error);
        });
});
