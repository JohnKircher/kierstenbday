document.addEventListener('DOMContentLoaded', function() {
    // Gift cards data - changed to let so we can update it
    let giftCards = [
        {
            id: 1,
            title: "Baseball Game",
            description: "Hot Dogs and fun at nat's park!",
            icon: "fas fa-baseball",
            password: "400freakplay",
            redeemed: false
        },
        {
            id: 2,
            title: "Dinner & Drinks",
            description: "We go get food! You choose restaurant, I maybe pay...",
            icon: "fas fa-utensils",
            password: "400freakplay",
            redeemed: false
        },
        {
            id: 3,
            title: "Massage",
            description: "massage! woo!",
            icon: "fas fa-spa",
            password: "400freakplay",
            redeemed: false
        },
        {
            id: 4,
            title: "Weekend Away",
            description: "We go somewhere super fun!",
            icon: "fas fa-umbrella-beach",
            password: "400freakplay",
            redeemed: false
        },
        {
            id: 5,
            title: "Movie Night",
            description: "Snacks, Ice Cream, and twilight? idk maybe?",
            icon: "fas fa-film",
            password: "400freakplay",
            redeemed: false
        },
        {
            id: 6,
            title: "Dinner & Drinks 2",
            description: "We get food again, and I might pay but idk",
            icon: "fas fa-utensils",
            password: "400freakplay",
            redeemed: false
        }
    ];

    // DOM Elements
    const cardsContainer = document.getElementById('cardsContainer');
    const redeemModal = document.getElementById('redeemModal');
    const closeBtn = document.querySelector('.close-btn');
    const confirmRedeemBtn = document.getElementById('confirmRedeem');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const giftNameSpan = document.getElementById('giftName');
    
    let selectedCard = null;

    // Load redeemed gifts from server
    async function loadRedeemedGifts() {
        try {
            console.log('Loading redeemed gifts...');
            const response = await fetch('/api/redeemed');
            
            // Check if response is OK
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            // Verify content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const body = await response.text();
                throw new Error(`Expected JSON but got: ${contentType}. Body: ${body.substring(0, 100)}...`);
            }
            
            const data = await response.json();
            console.log('Received redeemed gifts:', data);
            
            // Update redeemed status
            giftCards.forEach(card => {
                card.redeemed = data.redeemedGifts.includes(card.id);
            });
            
            return true;
        } catch (error) {
            console.error('Error loading redeemed gifts:', error);
            alert("Couldn't load redeemed gifts. Please refresh the page.");
            return false;
        }
    }

    // Render all gift cards
    function renderCards() {
        cardsContainer.innerHTML = '';
        
        giftCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `card ${card.redeemed ? 'redeemed' : ''}`;
            cardElement.innerHTML = `
                <div class="icon"><i class="${card.icon}"></i></div>
                <h3>${card.title}</h3>
                <p>${card.description}</p>
                ${card.redeemed ? 
                    '<div class="redeemed-label">✓ Redeemed</div>' : 
                    `<button class="btn redeem-btn" data-id="${card.id}">Redeem</button>`
                }
            `;
            cardsContainer.appendChild(cardElement);
        });
    }

    // Handle redeem button click
    function handleRedeemClick(e) {
        e.stopPropagation();
        const cardId = parseInt(e.target.getAttribute('data-id'));
        selectedCard = giftCards.find(card => card.id === cardId);
        giftNameSpan.textContent = selectedCard.title;
        redeemModal.style.display = 'flex';
    }

    // Handle confirm redemption
    async function handleConfirmRedeem() {
        if (passwordInput.value === selectedCard.password) {
            // Mark as redeemed
            selectedCard.redeemed = true;
            
            // Send to server
            try {
                const response = await fetch('/api/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        gift: selectedCard.title,
                        giftId: selectedCard.id 
                    })
                });
                
                if (!response.ok) throw new Error('Failed to save redemption');
                
                // Success
                createConfetti();
                redeemModal.style.display = 'none';
                passwordInput.value = '';
                errorMessage.style.display = 'none';
                renderCards();
                
                alert(`🎉 Success! You've redeemed "${selectedCard.title}". I'll be in touch soon!`);
            } catch (error) {
                console.error('Redemption error:', error);
                alert('Failed to save redemption. Please try again.');
            }
        } else {
            errorMessage.textContent = "Incorrect password. Hint: name of freaky polar bear";
            errorMessage.style.display = 'block';
        }
    }

    function createConfetti() {
        const colors = ['#ff6b6b', '#ff8e8e', '#ffb3b3', '#e84393', '#fd79a8', '#a29bfe', '#74b9ff', '#55efc4', '#ffeaa7'];
        const confettiCount = 250; // Increased from 100
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random positioning - now covers entire viewport
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -10 + 'vh'; // Start above viewport
            
            // More variety in shapes and sizes
            const size = Math.random() * 15 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            // Random shapes (square or circle)
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Longer animation with more variation
            const animationDuration = Math.random() * 5 + 5; // 5-10 seconds
            confetti.style.animationDuration = animationDuration + 's';
            
            // Random rotation
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            document.body.appendChild(confetti);
            
            // Remove after animation completes
            setTimeout(() => confetti.remove(), animationDuration * 1000);
        }
    }

    // Initialize the app
    async function initialize() {
        // Load redeemed status first
        const loaded = await loadRedeemedGifts();
        
        if (loaded) {
            // Then render cards
            renderCards();
            
            // Set up event listeners
            document.querySelectorAll('.redeem-btn').forEach(btn => {
                btn.addEventListener('click', handleRedeemClick);
            });
            
            closeBtn.addEventListener('click', () => {
                redeemModal.style.display = 'none';
                passwordInput.value = '';
                errorMessage.style.display = 'none';
            });
            
            confirmRedeemBtn.addEventListener('click', handleConfirmRedeem);
            
            window.addEventListener('click', (e) => {
                if (e.target === redeemModal) {
                    redeemModal.style.display = 'none';
                    passwordInput.value = '';
                    errorMessage.style.display = 'none';
                }
            });
            
            // Parallax effect
            document.addEventListener('mousemove', (e) => {
                const cards = document.querySelectorAll('.card');
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                cards.forEach((card, index) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenterX = cardRect.left + cardRect.width / 2;
                    const cardCenterY = cardRect.top + cardRect.height / 2;
                    
                    const distanceX = mouseX - cardCenterX;
                    const distanceY = mouseY - cardCenterY;
                    
                    const moveX = distanceX * 0.01 * (index % 2 === 0 ? 1 : -1);
                    const moveY = distanceY * 0.01 * (index % 3 === 0 ? 1 : -1);
                    
                    const rotateY = moveX * 0.25;
                    const rotateX = moveY * -0.25;
                    
                    card.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
            });
            
            cardsContainer.addEventListener('mouseleave', () => {
                document.querySelectorAll('.card').forEach(card => {
                    card.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0)';
                });
            });
        }
    }

    // Start the app
    initialize();
});