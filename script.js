// Amazon API Configuration
const amazonKey = 'd0fa1b419dmsh052091ed0d749aap1d4de2jsnea650b49defb';
const amazonHost = 'real-time-amazon-data.p.rapidapi.com';

// BestBuy API Configuration
const bestBuyKey = 'd0fa1b419dmsh052091ed0d749aap1d4de2jsnea650b49defb';//  ef8648faa1msh3c2b7cd532e917fp1ed32djsneffbc5a032f3
const bestBuyHost = 'bestbuy14.p.rapidapi.com';

document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');

    async function handleSearch() {
        document.querySelector("#intro").style.display = "none";
        const query = searchBar.value;
        if (query) {
            const amazonData = await fetchAmazonData(query);
            const bestBuyData = await fetchBestBuyData(query);

            const combinedData = [...amazonData, ...bestBuyData];
            updateSummary(combinedData);
            displayResults('two', amazonData, 'Amazon');
            displayResults('three', bestBuyData, 'BestBuy');
        }
    }

    searchButton.addEventListener('click', handleSearch);

    searchBar.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    });
});

async function fetchAmazonData(query) {
    const amazonUrl = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US`;
    const amazonOptions = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': amazonKey,
            'X-RapidAPI-Host': amazonHost
        }
    };

    try {
        const response = await fetch(amazonUrl, amazonOptions);
        const result = await response.json();
        return result.data.products || [];
    } catch (error) {
        console.error('Error fetching Amazon data:', error);
        return [];
    }
}

async function fetchBestBuyData(query) {
    const bestBuyUrl = `https://bestbuy14.p.rapidapi.com/searchByKeyword?keyword=${encodeURIComponent(query)}&page=1`;
    const bestBuyOptions = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': bestBuyKey,
            'x-rapidapi-host': bestBuyHost
        }
    };

    try {
        const response = await fetch(bestBuyUrl, bestBuyOptions);
        const result = await response.json();
        return result|| [];
    } catch (error) {
        console.error('Error fetching BestBuy data:', error);
        return [];
    }
}

function displayResults(containerId, data, source) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!data.length) {
        container.innerHTML = `No results found on ${source}.`;
        return;
    }

    data.forEach(item => {
        const product = document.createElement('div');
        product.classList.add('product');
        
        let message = '';
        if (source === 'Amazon') {
            message = getMessageBasedOnRating(item.product_star_rating);
            product.innerHTML = `
                <img src="${item.product_photo}" alt="${item.product_title}">
                <div class="product-details">
                    <h3>${item.product_title}</h3>
                    <p>Price: ${item.product_price} ${item.currency}</p>
                    <p>Rating: ${item.product_star_rating} (${item.product_num_ratings} ratings)</p>
                    <p>Sales Volume: ${item.sales_volume}</p>
                    <p>Delivery: ${item.delivery}</p>
                    <a href="${item.product_url}" target="_blank">View on ${source}</a>
                    <p class="rating-message">${message}</p>
                </div>
            `;
        } else if (source === 'BestBuy') {
            message = getMessageBasedOnRating(item.customerRatings);
            product.innerHTML = `
                <img src="https://pisces.bbystatic.com/${item.image.src}" alt="${item.image.alt}">
                <div class="product-details">
                    <h3>${item.name}</h3>
                    <p>Price: ${item.price} $</p>
                    <p>Rating: ${item.customerRatings} (${item.numberOfReviews} ratings)</p>
                    <p>Product ID: ${item.skuId}</p>
                    <a href="${item.categoryDetail.url}" target="_blank">View on ${source}</a>
                    <p class="rating-message">${message}</p>
                </div>
            `;
        }

        container.appendChild(product);
    });

    highlightBestProducts(data, container);
}

function getMessageBasedOnRating(rating) {
    if (rating >= 4.5) {
        return "Best product to buy.";
    } else if (rating >= 3.5) {
        return "Great quality, highly recommended.";
    } else if (rating >= 2.5) {
        return "Good, but some issues.";
    } else if (rating >= 1.5) {
        return "Better options available elsewhere.";
    } else {
        return "Not recommended at all.";
    }
}

// function displayResults(containerId, data, source) {
//     const container = document.getElementById(containerId);
//     container.innerHTML = '';

//     if (!data.length) {
//         container.innerHTML = `No results found on ${source}.`;
//         return;
//     }

//     data.forEach(item => {
//         const product = document.createElement('div');
//         product.classList.add('product');
        
//         if (source === 'Amazon') {
//             product.innerHTML = `
//                 <img src="${item.product_photo}" alt="${item.product_title}">
//                 <div class="product-details">
//                     <h3>${item.product_title}</h3>
//                     <p>Price: ${item.product_price} ${item.currency}</p>
//                     <p>Rating: ${item.product_star_rating} (${item.product_num_ratings} ratings)</p>
//                     <p>Sales Volume: ${item.sales_volume}</p>
//                     <p>Delivery: ${item.delivery}</p>
//                     <a href="${item.product_url}" target="_blank">View on ${source}</a>
//                 </div>
//             `;
//         } else if (source === 'BestBuy') {
//             product.innerHTML = `
//                 <img src="https://pisces.bbystatic.com/${item.image.src}" alt="${item.image.alt}">
//                 <div class="product-details">
//                     <h3>${item.name}</h3>
//                     <p>Price: ${item.price} $</p>
//                     <p>Rating: ${item.customerRatings} (${item.numberOfReviews} ratings)</p>
//                     <p>Product ID: ${item.skuId}</p>
//                     <a href="${item.categoryDetail.url}" target="_blank">View on ${source}</a>
//                 </div>
//             `;
//         }

//         container.appendChild(product);
//     });

//     highlightBestProducts(data, container);
// }

function highlightBestProducts(data, container) {
    let lowestPrice = Infinity;
    let highestRating = -Infinity;

    data.forEach(product => {
        const price = parseFloat(product.product_price || product.price);
        const rating = parseFloat(product.product_star_rating || product.customerRatings);

        if (price < lowestPrice) {
            lowestPrice = price;
        }

        if (rating > highestRating) {
            highestRating = rating;
        }
    });

    const products = container.getElementsByClassName('product');

    Array.from(products).forEach(product => {
        const price = parseFloat(product.querySelector('.product-details p:nth-child(2)').innerText.split(' ')[1]);
        const rating = parseFloat(product.querySelector('.product-details p:nth-child(3)').innerText.split(' ')[1]);

        if (price === lowestPrice) {
            product.classList.add('highlight-price');
        }

        if (rating === highestRating) {
            product.classList.add('highlight-rating');
        }
    });
}

function updateSummary(data) {
    const summary = document.getElementById('comparison-summary');
    let lowestPrice = Infinity;
    let highestRating = -Infinity;
    let bestSentiment = -Infinity;
    let cheapestProductUrl = '';

    data.forEach(product => {
        const price = parseFloat(product.product_price || product.price);
        const rating = parseFloat(product.product_star_rating || product.customerRatings);

        if (price < lowestPrice) {
            lowestPrice = price;
            cheapestProductUrl = product.product_url || product.categoryDetail.url;
        }

        if (rating > highestRating) {
            highestRating = rating;
        }

        // Assuming a static sentiment score for simplicity
        const sentimentScore = Math.random() * 10; // Replace with actual sentiment score calculation
        if (sentimentScore > bestSentiment) {
            bestSentiment = sentimentScore;
        }
    });

    // summary.innerHTML = `
    //     <p>Cheapest Price: $${lowestPrice}</p>
    //     <p>Highest Rating: ${highestRating}</p>
    //     <p>Best Sentiment: ${bestSentiment}</p>
    //     <p>Cheapest Product: <a href="${cheapestProductUrl}" target="_blank">View Product</a></p>
    // `;
}
