/**
 * KF STUDIO — LÓGICA E INTERATIVIDADE CLIENT-SIDE (DESIGN LIGHT)
 * 
 * Este script gerencia as interações do usuário, animações de scroll reveal,
 * contagem progressiva e a validação do formulário com sanitização de perímetro (Zero-Trust).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. NAVIGATION DRAWER MOBILE (ACCESSIBILITY & INTERACTIONS)
    // ==========================================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-item, .btn-nav-cta');

    const toggleMobileMenu = () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Evitar rolagem de fundo com menu ativo
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    };

    const closeMobileMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', toggleMobileMenu);
        
        // Fechar gaveta ao clicar em um link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Fechar ao clicar fora da gaveta
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    // ==========================================================================
    // 2. DYNAMIC NAVBAR SCROLL BEHAVIOR
    // ==========================================================================
    const header = document.getElementById('header');
    
    const handleHeaderScroll = () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Execução inicial de precaução

    // ==========================================================================
    // 3. SMOOTH SCROLL ACCESSIBILITY FIX
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Transfere o foco de teclado para leitores de tela
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus({ preventScroll: true });
            }
        });
    });

    // ==========================================================================
    // 4. PERFORMANCE SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Deixa de observar após revelar
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback completo se sem suporte ao Observer
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // ==========================================================================
    // 5. ANIMATED STATS BAR COUNTER
    // ==========================================================================
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const runAnimatedCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // 2 segundos
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;
        
        const timer = setInterval(() => {
            current += 1;
            element.textContent = `${current}+`;
            
            if (current >= target) {
                element.textContent = `${target}+`;
                clearInterval(timer);
            }
        }, Math.max(stepTime, 15));
    };

    const statsBar = document.querySelector('.stats-bar-container');
    if (statsBar && 'IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(num => runAnimatedCounter(num));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        statsObserver.observe(statsBar);
    } else {
        statNumbers.forEach(num => {
            num.textContent = `${num.getAttribute('data-target')}+`;
        });
    }

    // ==========================================================================
    // 6. PORTFOLIO FILTER HANDLERS
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Alterna estado visual ativo nos botões
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const filterType = btn.getAttribute('data-filter');

            // Filtra os cartões baseados em suas categorias
            portfolioCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterType === 'all' || category === filterType) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==========================================================================
    // 7. INPUT MASK & CHAR COUNT
    // ==========================================================================
    const phoneInput = document.getElementById('form-phone');
    const messageInput = document.getElementById('form-message');
    const charCounter = document.getElementById('char-counter');

    const formatWhatsApp = (val) => {
        if (!val) return val;
        const cleaned = val.replace(/\D/g, ''); // Limpa caracteres não numéricos
        
        if (cleaned.length <= 2) {
            return `(${cleaned}`;
        }
        if (cleaned.length <= 6) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
        }
        if (cleaned.length <= 10) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
        }
        return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    };

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatWhatsApp(e.target.value);
        });
    }

    if (messageInput && charCounter) {
        messageInput.addEventListener('input', (e) => {
            const currentLength = e.target.value.length;
            charCounter.textContent = `${currentLength} / 500`;
            
            if (currentLength >= 450) {
                charCounter.style.color = 'var(--color-primary)';
            } else {
                charCounter.style.color = '';
            }
        });
    }

    // ==========================================================================
    // 8. ZERO-TRUST FORM VALIDATION & CLEANING (APPSEC SHIELD)
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const successBanner = document.getElementById('form-success-banner');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formResetBtn = document.getElementById('form-reset-btn');

    // 🔒 SEGURANÇA [Lei 10]: Codificação contra ataques de XSS (Cross-Site Scripting)
    const encodeHTMLStr = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    const showInputError = (id, errId, msg) => {
        const input = document.getElementById(id);
        const errSpan = document.getElementById(errId);
        
        if (input && errSpan) {
            input.closest('.form-group-bottom-line').classList.add('has-error');
            errSpan.textContent = msg; // 🔒 SEGURANÇA [Lei 10]: Usa textContent, previne injeções HTML indiretas
            errSpan.classList.add('visible');
        }
    };

    const hideInputError = (id, errId) => {
        const input = document.getElementById(id);
        const errSpan = document.getElementById(errId);
        
        if (input && errSpan) {
            input.closest('.form-group-bottom-line').classList.remove('has-error');
            errSpan.textContent = '';
            errSpan.classList.remove('visible');
        }
    };

    const runFormValidation = () => {
        let isFormValid = true;
        
        const nameText = document.getElementById('form-name').value.trim();
        const phoneText = phoneInput.value.trim();
        const serviceSelect = document.getElementById('form-service').value;
        const messageText = messageInput.value.trim();

        // Validar Nome
        if (nameText.length < 3) {
            showInputError('form-name', 'error-name', 'Digite seu nome completo (mínimo de 3 letras).');
            isFormValid = false;
        } else if (nameText.length > 80) {
            showInputError('form-name', 'error-name', 'O nome ultrapassou o tamanho limite.');
            isFormValid = false;
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nameText)) {
            showInputError('form-name', 'error-name', 'Por favor, digite apenas letras no nome.');
            isFormValid = false;
        } else {
            hideInputError('form-name', 'error-name');
        }

        // Validar Telefone
        const numberDigits = phoneText.replace(/\D/g, '');
        if (numberDigits.length < 10 || numberDigits.length > 11) {
            showInputError('form-phone', 'error-phone', 'Insira um WhatsApp válido com DDD de 10 ou 11 dígitos.');
            isFormValid = false;
        } else {
            hideInputError('form-phone', 'error-phone');
        }

        // Validar Serviço Selecionado
        if (!serviceSelect) {
            showInputError('form-service', 'error-service', 'Escolha o tipo de serviço que você precisa.');
            isFormValid = false;
        } else {
            hideInputError('form-service', 'error-service');
        }

        // Validar Mensagem
        if (messageText.length < 10) {
            showInputError('form-message', 'error-message', 'Sua mensagem deve descrever brevemente sua ideia (mínimo 10 caracteres).');
            isFormValid = false;
        } else if (messageText.length > 500) {
            showInputError('form-message', 'error-message', 'A mensagem excede o limite máximo de 500 caracteres.');
            isFormValid = false;
        } else {
            hideInputError('form-message', 'error-message');
        }

        return isFormValid;
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!runFormValidation()) return;
            
            // Ativa Loader
            formSubmitBtn.classList.add('submitting');
            formSubmitBtn.disabled = true;

            const clientData = {
                name: document.getElementById('form-name').value,
                phone: phoneInput.value,
                service: document.getElementById('form-service').value,
                msg: messageInput.value
            };

            // Higieniza todas as entradas antes de qualquer processo posterior (Zero-Trust)
            const cleanData = {
                name: encodeHTMLStr(clientData.name.trim()),
                phone: encodeHTMLStr(clientData.phone.trim()),
                service: encodeHTMLStr(clientData.service.trim()),
                msg: encodeHTMLStr(clientData.msg.trim())
            };

            // Simula processamento assíncrono de envio
            setTimeout(() => {
                // Registro interno de auditoria e logging seguro (sem vazar dados brutos ou segredos - Lei 14)
                console.log(`[KF Studio AppSec] Contato seguro recebido e higienizado com sucesso. ID Nome: ${cleanData.name.substring(0, 15)}...`);
                
                // Desativa Loader
                formSubmitBtn.classList.remove('submitting');
                formSubmitBtn.disabled = false;
                
                // Esconde formulário e revela sucesso
                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successBanner.style.display = 'flex';
                    successBanner.setAttribute('aria-hidden', 'false');
                    setTimeout(() => {
                        successBanner.classList.add('active');
                    }, 50);
                }, 300);

            }, 1500);
        });
    }

    // Resetar Formulário
    if (formResetBtn && contactForm && successBanner) {
        formResetBtn.addEventListener('click', () => {
            successBanner.classList.remove('active');
            
            setTimeout(() => {
                successBanner.style.display = 'none';
                successBanner.setAttribute('aria-hidden', 'true');
                
                contactForm.reset();
                if (charCounter) charCounter.textContent = '0 / 500';
                
                // Limpa marcações de erro visuais anteriores
                document.querySelectorAll('.form-group-bottom-line').forEach(g => {
                    g.classList.remove('has-error');
                });
                document.querySelectorAll('.error-text').forEach(t => {
                    t.textContent = '';
                    t.classList.remove('visible');
                });

                contactForm.style.display = 'flex';
                setTimeout(() => {
                    contactForm.style.opacity = '1';
                }, 50);
            }, 300);
        });
    }

});
