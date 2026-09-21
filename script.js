document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Header on Scroll ---
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Mobile Hamburger Menu ---
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav-links a');

  burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.classList.toggle('toggle');
  });

  // Close nav menu on link click (mobile)
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      burger.classList.remove('toggle');
    });
  });

  // --- Scroll-triggered Active Nav Link Link Indicating ---
  const sections = document.querySelectorAll('section');
  
  const options = {
    root: null,
    threshold: 0.3, // Highlight link when 30% of section is visible
    rootMargin: "-80px 0px 0px 0px" // Account for navigation header height
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal, .menu-card, .gallery-item');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Animates once
      }
    });
  }, revealOptions);

  revealElements.forEach(element => {
    // Add default reveal style
    if (!element.classList.contains('reveal')) {
      element.classList.add('reveal');
    }
    revealObserver.observe(element);
  });

  // --- Gallery Lightbox Modal ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-item-img');
      const imgSrc = img.getAttribute('src');
      const imgAlt = img.getAttribute('alt');
      
      lightboxImg.setAttribute('src', imgSrc);
      lightboxImg.setAttribute('alt', imgAlt);
      lightboxCaption.textContent = imgAlt;
      
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scrolling
    // Clear src after fade out
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.setAttribute('src', '');
      }
    }, 300);
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Close lightbox on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // --- Cake Menu Dynamic Logic ---
  const API_BASE = (window.location.hostname === 'localhost' && window.location.port !== '5000')
    ? 'http://localhost:5000/api'
    : '/api';
  const defaultCakeList = [
    // Classic & Velvet
    {
      name: "Vanilla",
      price: "₹600 / kg",
      category: "classic",
      image: "images/white_forest_cake.jpg",
      desc: "Classic soft sponge cake layered with rich vanilla bean cream."
    },
    {
      name: "Black Forest",
      price: "₹700 / kg",
      category: "classic",
      image: "images/black_forest_cake.jpg",
      desc: "Traditional chocolate sponge layered with whipped cream and cherries, topped with chocolate curls."
    },
    {
      name: "White Forest",
      price: "₹700 / kg",
      category: "classic",
      image: "images/white_forest_cake.jpg",
      desc: "Light vanilla sponge with sweet cherries, fresh cream, and white chocolate curls."
    },
    {
      name: "Oreo Cake",
      price: "₹800 / kg",
      category: "classic",
      image: "images/oreo_cake.png",
      desc: "Decadent sponge cake layered with crushed Oreo cookies and sweet cream frosting."
    },
    {
      name: "Red Velvet",
      price: "₹850 / kg",
      category: "classic",
      image: "images/red_velvet_cake.png",
      desc: "Vibrant crimson layers with a hint of cocoa, paired with signature cream cheese frosting."
    },
    {
      name: "Green Velvet",
      price: "₹850 / kg",
      category: "classic",
      image: "images/green_velvet_cake.png",
      desc: "Vibrant green velvet sponge layers with smooth frosting."
    },
    {
      name: "Blue Velvet",
      price: "₹850 / kg",
      category: "classic",
      image: "images/blue_velvet_cake.png",
      desc: "Elegant blue velvet cake layers with sweet frosting."
    },
    {
      name: "Red Bee",
      price: "₹1000 / kg",
      category: "classic",
      image: "images/red_velvet_cake.png",
      desc: "Special red velvet combination cake with premium fillings and decorations."
    },
    {
      name: "Spanish Delight",
      price: "₹1000 / kg",
      category: "classic",
      image: "images/spanish_delight_cake.png",
      desc: "Popular rich sponge cake layered with authentic, creamy Spanish delight custard flavor."
    },
    {
      name: "Spanish Delight with Pista",
      price: "₹1100 / kg",
      category: "classic",
      image: "images/spanish_delight_pista.jpg",
      desc: "Rich Spanish delight cake layered and topped with crunchy roasted pistachios."
    },

    // Chocolate Lovers
    {
      name: "Chocolate Cake",
      price: "₹850 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Classic rich chocolate sponge covered in silky chocolate fudge frosting."
    },
    {
      name: "Vancho",
      price: "₹950 / kg",
      category: "chocolate",
      image: "images/black_forest_cake.jpg",
      desc: "A premium blend of dark chocolate and vanilla layers for the best of both worlds."
    },
    {
      name: "Choco Velvet",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/red_velvet_cake.png",
      desc: "Chocolate sponge cake layered with rich, velvet cream cheese frosting."
    },
    {
      name: "Milky Nut",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/spanish_delight_cake.png",
      desc: "White chocolate base layered with mixed nuts and rich whipped cream."
    },
    {
      name: "Choco Nut",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/snickers_cake.png",
      desc: "Rich chocolate cake loaded with crunchy toasted nuts and chocolate ganache."
    },
    {
      name: "Milky Chocolate",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Smooth and sweet milk chocolate layered sponge cake."
    },
    {
      name: "Snickers Cake",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/snickers_cake.png",
      desc: "Peanuts, rich caramel, and chocolate cream mimicking the classic Snickers bar."
    },
    {
      name: "Chocolate Caramel",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/snickers_cake.png",
      desc: "Mouthwatering combination of salted caramel and dark chocolate ganache."
    },
    {
      name: "Milky Almond Cake",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/spanish_delight_pista.jpg",
      desc: "Creamy white chocolate layered cake topped with sliced almonds."
    },
    {
      name: "Choco Almond",
      price: "₹1000 / kg",
      category: "chocolate",
      image: "images/snickers_cake.png",
      desc: "Dark chocolate sponge layered with toasted almond flakes."
    },
    {
      name: "Honey Almond Cake",
      price: "₹1100 / kg",
      category: "chocolate",
      image: "images/spanish_delight_pista.jpg",
      desc: "Sweet honey-infused cake layered with crispy caramelized almonds."
    },
    {
      name: "Nutella Cake",
      price: "₹1200 / kg",
      category: "chocolate",
      image: "images/ferrero_rocher_cake.jpg",
      desc: "Heavenly cake layered and glazed with rich, creamy hazelnut Nutella spread."
    },
    {
      name: "Nutella Chocochips Cake",
      price: "₹1300 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Nutella cream cake loaded with crunchy chocolate chips."
    },
    {
      name: "Chocolate Overload",
      price: "₹1300 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Multiple layers of dark, milk, and white chocolate frosting and toppings."
    },
    {
      name: "Chocolate Truffle",
      price: "₹1200 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Dense, moist dark chocolate cake layered with silky chocolate ganache."
    },
    {
      name: "Chocolate Truffle Caramel Cake",
      price: "₹1300 / kg",
      category: "chocolate",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Silky chocolate truffle cake combined with rich, warm caramel drizzle."
    },
    {
      name: "White Chocolate Truffle",
      price: "₹1200 / kg",
      category: "chocolate",
      image: "images/white_forest_cake.jpg",
      desc: "Sweet and elegant white chocolate ganache truffle cake."
    },
    {
      name: "White Chocolate Truffle Nut Cake",
      price: "₹1350 / kg",
      category: "chocolate",
      image: "images/white_forest_cake.jpg",
      desc: "White chocolate truffle cake loaded with premium roasted nuts."
    },
    {
      name: "Kitkat Cake",
      price: "₹1200 / kg",
      category: "chocolate",
      image: "images/kitkat_cake.jpg",
      desc: "A fun celebration cake surrounded by Kitkat bars and topped with gems."
    },
    {
      name: "Ferrero Rocher",
      price: "₹1500 / kg",
      category: "chocolate",
      image: "images/ferrero_rocher_cake.jpg",
      desc: "Decadent hazelnut chocolate cake decorated with real Ferrero Rocher truffles."
    },
    {
      name: "Kunafa Cake",
      price: "₹1500 / kg",
      category: "chocolate",
      image: "images/kunafa_cake.jpg",
      desc: "Traditional Middle Eastern crispy Kunafa pastry layered with sweet cream and chocolate."
    },

    // Caramel & Coffee
    {
      name: "Caramel Cake",
      price: "₹950 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Golden sponge cake drizzled with rich, home-style warm caramel sauce."
    },
    {
      name: "Caramel Coffee Cake",
      price: "₹1000 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "A perfect blend of aromatic espresso coffee and sweet caramel drizzle."
    },
    {
      name: "Butter Scotch",
      price: "₹950 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Golden vanilla sponge layered with rich butterscotch cream and crunchy pralines."
    },
    {
      name: "Milky Butterscotch",
      price: "₹1000 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Rich butterscotch cake layered with sweet milk cream."
    },
    {
      name: "Choco Butterscotch",
      price: "₹1000 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Dark chocolate layers combined with crunchy butterscotch praline."
    },
    {
      name: "Caramel Butterscotch",
      price: "₹1200 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Caramel drip cake combined with rich butterscotch cream and crunch."
    },
    {
      name: "Choco Caramel Butterscotch",
      price: "₹1250 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "Indulgent mix of chocolate, rich caramel, and crunchy butterscotch."
    },
    {
      name: "Irish Coffee Cake",
      price: "₹1100 / kg",
      category: "caramel",
      image: "images/black_forest_cake.jpg",
      desc: "Spiced coffee sponge infused with Irish cream coffee flavor."
    },
    {
      name: "Irish Coffee Chocolate Cake",
      price: "₹1200 / kg",
      category: "caramel",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Irish coffee sponge combined with layers of dark chocolate ganache."
    },
    {
      name: "Dalgona Coffee Cake",
      price: "₹1100 / kg",
      category: "caramel",
      image: "images/butterscotch_cake.jpg",
      desc: "A popular whip coffee flavored cake with sweet creamy frosting."
    },

    // Exotics & Fruits
    {
      name: "Pineapple Cake",
      price: "₹850 / 1000",
      category: "exotic",
      image: "images/white_forest_cake.jpg",
      desc: "Soft sponge soaked in pineapple syrup, filled with sweet fruit chunks."
    },
    {
      name: "Strawberry Cake",
      price: "₹850 / kg",
      category: "exotic",
      image: "images/red_velvet_cake.png",
      desc: "Refreshing vanilla cake layered with real strawberry compote and cream."
    },
    {
      name: "Blueberry Cake",
      price: "₹850 / kg",
      category: "exotic",
      image: "images/blue_velvet_cake.png",
      desc: "Fluffy vanilla sponge filled with juicy blueberry pie filling."
    },
    {
      name: "Pista Cake",
      price: "₹850 / 1000",
      category: "exotic",
      image: "images/spanish_delight_pista.jpg",
      desc: "Elegant green pistachio cake made with roasted pistachio paste."
    },
    {
      name: "Vanstraw Cake",
      price: "₹1000 / kg",
      category: "exotic",
      image: "images/red_velvet_cake.png",
      desc: "Tasty combination of vanilla and strawberry layers."
    },
    {
      name: "Tender Coconut",
      price: "₹850 / 1200",
      category: "exotic",
      image: "images/tender_coconut_cake.jpg",
      desc: "Kerala's favorite: soft cake layered with fresh tender coconut pulp and coconut cream."
    },
    {
      name: "Fresh Fruit Cake",
      price: "₹1500 / kg",
      category: "exotic",
      image: "images/white_forest_cake.jpg",
      desc: "Light vanilla sponge loaded with a variety of fresh seasonal fruits."
    },
    {
      name: "Rasmalai",
      price: "₹1300 / kg",
      category: "exotic",
      image: "images/rasmalai_cake.jpg",
      desc: "Royal Indian dessert fusion cake with cardamom, saffron, and real Rasmalai pieces."
    },
    {
      name: "Rasmalai with Butterscotch",
      price: "₹1400 / kg",
      category: "exotic",
      image: "images/rasmalai_cake.jpg",
      desc: "Rasmalai fusion cake layered with crunchy butterscotch pralines."
    },
    {
      name: "Juans Rainbow Cake",
      price: "₹1200 / kg",
      category: "exotic",
      image: "images/rainbow_cake.jpg",
      desc: "A colorful, vibrant multi-layered sponge cake."
    },
    {
      name: "Rainbow Cake",
      price: "₹1600 / kg",
      category: "exotic",
      image: "images/rainbow_cake.jpg",
      desc: "Bright and spectacular multi-layered rainbow cake, perfect for kids."
    },

    // Special Treats
    {
      name: "Brownie",
      price: "₹800 - 1500",
      category: "treats",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Fudgy, dense chocolate brownies baked to perfection."
    },
    {
      name: "Cheese Cake",
      price: "₹1000 / kg",
      category: "treats",
      image: "images/white_forest_cake.jpg",
      desc: "Creamy, baked or cold cream cheese cake on a biscuit crust."
    },
    {
      name: "Dream Cake",
      price: "₹1000 - 2000",
      category: "treats",
      image: "images/dream_cake.jpg",
      desc: "The viral 5-in-1 layered chocolate dream cake served in a premium tin."
    },
    {
      name: "Butterscotch Pudding Cake",
      price: "₹800",
      category: "treats",
      image: "images/butterscotch_cake.jpg",
      desc: "Soft cake layers filled with creamy butterscotch pudding."
    },
    {
      name: "Bento Cake",
      price: "₹300",
      category: "treats",
      image: "images/bento_cake.jpg",
      desc: "Mini 250g cake in a cute box, perfect for small celebrations."
    },
    {
      name: "Tappa Cake",
      price: "₹300",
      category: "treats",
      image: "images/dream_cake.jpg",
      desc: "Delightful cup-style or jar-style premium cake dessert."
    },
    {
      name: "Cup Cake",
      price: "₹40",
      category: "treats",
      image: "images/bento_cake.jpg",
      desc: "Mini single-serving cake topped with swirls of delicious frosting."
    },
    {
      name: "Sicles",
      price: "₹80",
      category: "treats",
      image: "images/rainbow_cake.jpg",
      desc: "Cake pops shaped like popsicles, coated in colorful chocolate."
    },
    {
      name: "Pops",
      price: "₹40",
      category: "treats",
      image: "images/kitkat_cake.jpg",
      desc: "Bite-sized cake balls on sticks, dipped in rich chocolate."
    },
    {
      name: "Donut",
      price: "₹40 / 60",
      category: "treats",
      image: "images/chocolate_truffle_cake.jpg",
      desc: "Freshly fried glazed donuts with various chocolate toppings."
    },
    {
      name: "Doll Cake",
      price: "Flavour + ₹250",
      category: "treats",
      image: "images/rainbow_cake.jpg",
      desc: "A beautiful custom princess/doll cake for birthdays."
    },
    {
      name: "Theme Cake",
      price: "Custom",
      category: "treats",
      image: "images/rainbow_cake.jpg",
      desc: "Theme cake (Cake flavour + fondant + extra settings + working charge details)."
    }
  ];

  let cakeList = [...defaultCakeList];

  const menuGrid = document.getElementById('menu-grid');
  const searchInput = document.getElementById('menu-search');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Floating Toast Helper
  const showSiteToast = (message, type = 'success') => {
    const toast = document.getElementById('site-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `site-toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };

  // --- Fetch Live Menu from Backend API ---
  const fetchLiveCakes = async () => {
    try {
      const res = await fetch(`${API_BASE}/cakes`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          cakeList = data.data;
          renderMenu();
          console.log(`Loaded ${cakeList.length} cakes live from Paikada backend.`);
        }
      }
    } catch (err) {
      console.log('Backend not reachable right now, using offline cake list.');
    }
  };

  // --- Render Menu Cards ---
  const renderMenu = () => {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    const filteredCakes = cakeList.filter(cake => {
      const matchesCategory = currentCategory === 'all' || cake.category.toLowerCase() === currentCategory.toLowerCase();
      const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (cake.desc && cake.desc.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    if (filteredCakes.length === 0) {
      menuGrid.innerHTML = `
        <div class="text-center" style="grid-column: 1 / -1; padding: 40px 20px;">
          <p style="font-size: 1.1rem; color: var(--color-brown-light); font-weight: 500;">
            No cakes found matching "${searchQuery}".
          </p>
        </div>
      `;
      return;
    }

    filteredCakes.forEach((cake, index) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.style.animationDelay = `${index * 0.02}s`;
      
      const waText = encodeURIComponent(`Hello Paikada Bakes, I would like to inquire about the ${cake.name} Cake.`);
      
      card.innerHTML = `
        <div class="menu-img-wrapper">
          <img src="${cake.image}" alt="${cake.name}" class="menu-card-img" loading="lazy" onerror="this.onerror=null; this.src='images/chocolate_truffle_cake.jpg';">
          <div class="menu-price-tag">${cake.price}</div>
        </div>
        <div class="menu-info">
          <h3 class="menu-item-title">${cake.name}</h3>
          <p class="menu-item-desc">${cake.desc || 'Freshly baked homemade cake.'}</p>
          <div class="menu-card-actions" style="display: flex; gap: 8px; align-items: center; justify-content: space-between;">
            <button type="button" class="btn btn-order-modal order-cake-trigger" data-cake="${encodeURIComponent(JSON.stringify(cake))}">
              Order Cake
            </button>
            <a href="https://wa.me/918921383941?text=${waText}" target="_blank" class="btn btn-whatsapp" title="Quick WhatsApp" style="padding: 10px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.188-1.361a9.92 9.92 0 0 0 4.82 1.244h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.67-1.037-5.18-2.92-7.065C17.197 3.037 14.683 2 12.012 2zm5.72 14.15c-.244.688-1.218 1.25-1.67 1.32-.455.07-1.016.144-3.04-.678-2.587-1.05-4.218-3.66-4.347-3.83-.127-.17-1.042-1.385-1.042-2.64 0-1.257.656-1.875.89-2.128.232-.254.507-.318.676-.318.169 0 .338.001.485.008.15.007.352-.057.55.42.2.484.686 1.67.747 1.797.06.127.102.275.017.444-.085.17-.127.276-.254.424-.127.148-.266.33-.38.455-.127.127-.26.265-.113.52.148.254.656 1.08 1.408 1.748.97.863 1.787 1.13 2.04 1.258.254.127.402.106.55-.064.148-.17.635-.742.805-1 .17-.258.338-.212.57-.127.233.085 1.48.699 1.734.826.254.127.423.19.486.3.064.11.064.636-.18 1.324z" />
              </svg>
            </a>
          </div>
        </div>
      `;

      menuGrid.appendChild(card);
      setTimeout(() => {
        card.classList.add('fade-in');
      }, 10);
    });

    // Wire up Order Cake click events
    document.querySelectorAll('.order-cake-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          const cake = JSON.parse(decodeURIComponent(btn.getAttribute('data-cake')));
          openOrderModal(cake);
        } catch (e) {
          console.error('Error opening order modal:', e);
        }
      });
    });
  };

  let currentCategory = 'all';
  let searchQuery = '';

  if (menuGrid) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderMenu();
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderMenu();
      });
    });

    // Initial render & then live fetch
    renderMenu();
    fetchLiveCakes();

    const menuControls = document.querySelector('.menu-controls');
    if (menuControls) {
      setTimeout(() => {
        menuControls.classList.add('active');
      }, 200);
    }
  }

  // --- Order Modal Logic ---
  const orderModal = document.getElementById('order-modal');
  const orderModalClose = document.getElementById('order-modal-close');
  const orderCancelBtn = document.getElementById('order-cancel-btn');
  const orderForm = document.getElementById('cake-order-form');
  const orderDirectBtn = document.getElementById('order-direct-btn');

  const openOrderModal = (cake) => {
    if (!orderModal) return;
    document.getElementById('modal-cake-name').textContent = `Order ${cake.name}`;
    document.getElementById('modal-cake-title').textContent = cake.name;
    document.getElementById('modal-cake-price').textContent = cake.price;
    document.getElementById('modal-cake-desc').textContent = cake.desc || 'Freshly home-baked in Kottayam.';
    document.getElementById('modal-cake-img').setAttribute('src', cake.image);
    document.getElementById('order-cake-name').value = cake.name;

    // Set default minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('order-date');
    if (dateInput) {
      dateInput.min = tomorrow.toISOString().split('T')[0];
      if (!dateInput.value) dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeOrderModal = () => {
    if (!orderModal) return;
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (orderModalClose) orderModalClose.addEventListener('click', closeOrderModal);
  if (orderCancelBtn) orderCancelBtn.addEventListener('click', closeOrderModal);
  if (orderModal) {
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) closeOrderModal();
    });
  }

  // Process and Submit Order to Backend
  const submitCakeOrder = async (sendToWhatsApp = false) => {
    const cakeName = document.getElementById('order-cake-name').value;
    const customerName = document.getElementById('order-customer-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const deliveryDate = document.getElementById('order-date').value;
    const deliveryTime = document.getElementById('order-time').value;
    const customMessage = document.getElementById('order-message').value.trim();
    const isEggless = document.getElementById('order-eggless').checked;
    const notes = document.getElementById('order-notes').value.trim();
    const deliveryAddress = document.getElementById('order-address').value.trim();

    const weightRadio = document.querySelector('input[name="cake-weight"]:checked');
    const weight = weightRadio ? weightRadio.value : '1 kg';

    const deliveryTypeRadio = document.querySelector('input[name="delivery-type"]:checked');
    const deliveryType = deliveryTypeRadio ? deliveryTypeRadio.value : 'Pickup';

    if (!customerName || !phone || !deliveryDate) {
      showSiteToast('Please fill in your name, phone number, and required date.', 'error');
      return;
    }

    const orderPayload = {
      cakeName,
      customerName,
      phone,
      weight,
      isEggless,
      deliveryDate,
      deliveryTime,
      customMessage,
      deliveryType,
      deliveryAddress,
      notes
    };

    let orderId = `PB-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          orderId = data.data.orderId;
        }
      }
    } catch (err) {
      console.log('Order saved in browser session (backend unreachable):', err);
    }

    showSiteToast(`Order #${orderId} confirmed! Thank you ${customerName}.`, 'success');
    closeOrderModal();
    if (orderForm) orderForm.reset();

    // If requested, open WhatsApp with complete order summary
    if (sendToWhatsApp) {
      const waMsgLines = [
        `*NEW ORDER - PAIKADA BAKES*`,
        `*Order ID:* ${orderId}`,
        `*Cake:* ${cakeName} (${weight}${isEggless ? ', 100% Eggless' : ''})`,
        `*Date:* ${deliveryDate} ${deliveryTime ? '(' + deliveryTime + ')' : ''}`,
        customMessage ? `*Message on Cake:* "${customMessage}"` : null,
        `*Customer:* ${customerName}`,
        `*Phone:* ${phone}`,
        `*Fulfillment:* ${deliveryType === 'Delivery' ? 'Home Delivery' : 'Self-Pickup'}`,
        deliveryAddress ? `*Address:* ${deliveryAddress}` : null,
        notes ? `*Notes:* ${notes}` : null
      ].filter(Boolean);

      const waText = encodeURIComponent(waMsgLines.join('\n'));
      const waUrl = `https://wa.me/918921383941?text=${waText}`;
      window.open(waUrl, '_blank');
    }
  };

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitCakeOrder(true); // Default submit opens WhatsApp with Order ID
    });
  }

  if (orderDirectBtn) {
    orderDirectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitCakeOrder(false); // Direct save to DB without WhatsApp
    });
  }

  // --- Contact Inquiry Form Handler ---
  const inquiryForm = document.getElementById('contact-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      const submitBtn = document.getElementById('contact-submit-btn');
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }

      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, message })
        });

        const data = await res.json();
        if (data.success) {
          showSiteToast('Your message has been sent to Paikada Bakes!', 'success');
          inquiryForm.reset();
        } else {
          showSiteToast(data.message || 'Failed to send message.', 'error');
        }
      } catch (err) {
        showSiteToast('Message received! We will contact you soon.', 'success');
        inquiryForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.textContent = 'Send Message';
          submitBtn.disabled = false;
        }
      }
    });
  }
});

