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
    // 5.2 STICKY STACKING CARDS ENHANCEMENT (SCALE DOWN & DEPTH ON SCROLL)
    // ==========================================================================
    const servicesWrapper = document.querySelector('.services-list-wrapper');
    const serviceItemsList = document.querySelectorAll('.service-item');
    
    if (servicesWrapper && serviceItemsList.length > 0) {
        const handleServicesStackingScale = () => {
            const isDesktop = window.innerWidth > 900;
            
            if (!isDesktop) {
                // 🔒 SEGURANÇA & PERFORMANCE: Limpa estilos inline no mobile para evitar jank e gargalos de GPU (filter/transform)
                serviceItemsList.forEach(item => {
                    item.style.transform = '';
                    item.style.filter = '';
                });
                return;
            }
            
            serviceItemsList.forEach((item, index) => {
                const nextCard = serviceItemsList[index + 1];
                
                if (nextCard) {
                    const nextRect = nextCard.getBoundingClientRect();
                    // Define o ponto de parada sticky do card seguinte de acordo com o breakpoint responsivo
                    const nextStickyStop = isDesktop ? (110 + (index + 1) * 30) : (80 + (index + 1) * 30);
                    
                    // Calcula a distância entre o topo do card seguinte e sua posição de parada sticky
                    const distanceToStickyActive = nextRect.top - nextStickyStop;
                    
                    // Começa o scale down quando o card de cima está a menos de 280px de travar
                    if (distanceToStickyActive < 280) {
                        const progress = Math.max(0, Math.min(1, (280 - distanceToStickyActive) / 280));
                        // Redução de escala de 1.0 a 0.93 para criar profundidade
                        const scale = 1 - (progress * 0.05); 
                        // Escurecimento sutil (brightness de 1.0 a 0.82) para dar a ilusão de sombra da aba
                        const brightness = 1 - (progress * 0.18);
                        
                        item.style.transform = `scale(${scale})`;
                        item.style.filter = `brightness(${brightness})`;
                    } else {
                        item.style.transform = 'scale(1)';
                        item.style.filter = 'brightness(1)';
                    }
                } else {
                    // O último card sempre mantém escala e brilho totais (100%)
                    item.style.transform = 'scale(1)';
                    item.style.filter = 'brightness(1)';
                }
            });
        };

        // Scroll listener passivo otimizado com requestAnimationFrame para evitar lags e manter 60fps constantes
        let animFrame;
        window.addEventListener('scroll', () => {
            if (!animFrame) {
                animFrame = requestAnimationFrame(() => {
                    handleServicesStackingScale();
                    animFrame = null;
                });
            }
        }, { passive: true });
        
        // Disparo inicial
        handleServicesStackingScale();
        
        // Tratar redimensionamentos de tela para recalcular os offsets
        window.addEventListener('resize', handleServicesStackingScale, { passive: true });
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

            // Processamento de envio antes do redirecionamento ao WhatsApp
            setTimeout(() => {
                // Registro interno de auditoria e logging seguro (sem vazar dados brutos ou segredos - Lei 14)
                console.log(`[KF Studio AppSec] Contato seguro recebido e higienizado com sucesso. ID Nome: ${cleanData.name.substring(0, 15)}...`);
                
                // Desativa Loader
                formSubmitBtn.classList.remove('submitting');
                formSubmitBtn.disabled = false;

                // Pega o texto amigável da opção do serviço selecionado
                const serviceSelectEl = document.getElementById('form-service');
                const serviceText = serviceSelectEl.options[serviceSelectEl.selectedIndex].text;

                // 📞 WHATSAPP REAL DO STUDIO: Substitua o número abaixo pelo real (com DDI e DDD, ex: 5515999999999)
                const studioWhatsAppNumber = '5515999999999';

                // Formatação profissional da mensagem com negritos para facilitar a leitura no celular
                const formattedMessage = `Olá, KF Studio! Gostaria de solicitar um orçamento:\n\n` +
                                         `*Nome:* ${cleanData.name}\n` +
                                         `*WhatsApp:* ${cleanData.phone}\n` +
                                         `*Serviço:* ${serviceText}\n` +
                                         `*Mensagem:* ${cleanData.msg}`;

                // Gera a URL do WhatsApp
                const whatsappUrl = `https://wa.me/${studioWhatsAppNumber}?text=${encodeURIComponent(formattedMessage)}`;

                // 🔒 SEGURANÇA [Lei 11, 15]: Redirecionamento seguro com isolamento de contexto (noopener, noreferrer)
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                
                // Esconde formulário e revela sucesso no site
                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successBanner.style.display = 'flex';
                    successBanner.setAttribute('aria-hidden', 'false');
                    setTimeout(() => {
                        successBanner.classList.add('active');
                    }, 50);
                }, 300);

            }, 1200);
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

    // ==========================================================================
    // 9. GALLERY PHOTO SLIDER (SWIPE / DRAG SUPPORT)
    // ==========================================================================
    const initializeSliders = () => {
        const sliderContainers = document.querySelectorAll('.slider-container');
        
        sliderContainers.forEach(container => {
            const wrapper = container.querySelector('.slider-wrapper');
            if (!wrapper) return;
            
            const slides = wrapper.querySelectorAll('.slider-slide');
            if (slides.length <= 1) {
                // Se só tem 1 slide, removemos indicadores de paginação caso existam
                const dotsContainer = container.querySelector('.slider-dots');
                if (dotsContainer) dotsContainer.remove();
                container.style.cursor = 'default';
                return;
            }
            
            let isDragging = false;
            let startX = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let animationID = 0;
            let currentIndex = 0;
            const dots = container.querySelectorAll('.dot');
            
            // Eventos de Toque
            container.addEventListener('touchstart', touchStart, { passive: true });
            container.addEventListener('touchend', touchEnd);
            container.addEventListener('touchmove', touchMove, { passive: true });
            
            // Eventos de Mouse
            container.addEventListener('mousedown', dragStart);
            container.addEventListener('mouseup', dragEnd);
            container.addEventListener('mouseleave', dragEnd);
            container.addEventListener('mousemove', dragMove);
            
            function touchStart(event) {
                startX = getPositionX(event);
                isDragging = true;
                animationID = requestAnimationFrame(animation);
                container.classList.add('grabbing');
            }
            
            function touchMove(event) {
                if (!isDragging) return;
                const currentX = getPositionX(event);
                const diff = currentX - startX;
                currentTranslate = prevTranslate + diff;
            }
            
            function touchEnd() {
                if (!isDragging) return;
                isDragging = false;
                cancelAnimationFrame(animationID);
                container.classList.remove('grabbing');
                
                const movedBy = currentTranslate - prevTranslate;
                
                // Limite de 80 pixels para mudar de slide
                if (movedBy < -80 && currentIndex < slides.length - 1) {
                    currentIndex += 1;
                } else if (movedBy > 80 && currentIndex > 0) {
                    currentIndex -= 1;
                }
                
                setPositionByIndex();
            }
            
            function dragStart(event) {
                event.preventDefault();
                startX = getPositionX(event);
                isDragging = true;
                animationID = requestAnimationFrame(animation);
                container.classList.add('grabbing');
            }
            
            function dragMove(event) {
                if (!isDragging) return;
                const currentX = getPositionX(event);
                const diff = currentX - startX;
                currentTranslate = prevTranslate + diff;
            }
            
            function dragEnd() {
                if (!isDragging) return;
                isDragging = false;
                cancelAnimationFrame(animationID);
                container.classList.remove('grabbing');
                
                const movedBy = currentTranslate - prevTranslate;
                
                if (movedBy < -80 && currentIndex < slides.length - 1) {
                    currentIndex += 1;
                } else if (movedBy > 80 && currentIndex > 0) {
                    currentIndex -= 1;
                }
                
                setPositionByIndex();
            }
            
            function getPositionX(event) {
                return event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
            }
            
            function animation() {
                setSliderPosition();
                if (isDragging) requestAnimationFrame(animation);
            }
            
            function setSliderPosition() {
                wrapper.style.transform = `translateX(${currentTranslate}px)`;
            }
            
            function setPositionByIndex() {
                currentTranslate = currentIndex * -container.clientWidth;
                prevTranslate = currentTranslate;
                wrapper.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                wrapper.style.transform = `translateX(${currentTranslate}px)`;
                
                // Limpa a transição temporária após o movimento para não travar o drag subsequente
                setTimeout(() => {
                    if (!isDragging) {
                        wrapper.style.transition = '';
                    }
                }, 400);
                
                updateDots();
            }
            
            function updateDots() {
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
            
            // Trata redimensionamento de tela ajustando a transição
            window.addEventListener('resize', () => {
                currentTranslate = currentIndex * -container.clientWidth;
                prevTranslate = currentTranslate;
                wrapper.style.transform = `translateX(${currentTranslate}px)`;
            });
        });
    };
    
    initializeSliders();

    // ==========================================================================
    // 10. HERO VIDEO SMART AUTOPLAY & FALLBACK MANAGEMENT
    // ==========================================================================
    const initializeHeroVideo = () => {
        const heroVideo = document.getElementById('hero-video-element');
        const heroPoster = document.getElementById('hero-video-poster');
        
        if (!heroVideo) return;
        
        const playHeroVideo = () => {
            heroVideo.play()
                .then(() => {
                    // Se começou a tocar com sucesso, faz o fade-in do vídeo
                    heroVideo.style.opacity = '1';
                    if (heroPoster) {
                        // Deixa o poster invisível suavemente
                        heroPoster.style.opacity = '0';
                    }
                })
                .catch((err) => {
                    console.log("[KF Studio AppSec] Autoplay da hero bloqueado pelo dispositivo (modo de energia ou política de mídia).");
                    // Mantém opacidade 0 para não mostrar botão de play quebrado no iOS Safari
                    heroVideo.style.opacity = '0';
                });
        };
        
        // Tenta tocar imediatamente no load
        playHeroVideo();
        
        // Listener de fallback: tenta tocar na primeira interação genuína do usuário
        const playOnInteraction = () => {
            if (heroVideo.paused) {
                playHeroVideo();
            }
            // Remove os listeners após a primeira tentativa de interação
            window.removeEventListener('scroll', playOnInteraction);
            window.removeEventListener('click', playOnInteraction);
            window.removeEventListener('touchstart', playOnInteraction);
        };
        
        window.addEventListener('scroll', playOnInteraction, { passive: true });
        window.addEventListener('click', playOnInteraction, { passive: true });
        window.addEventListener('touchstart', playOnInteraction, { passive: true });
    };
    
    initializeHeroVideo();

    // ==========================================================================
    // 11. PORTFOLIO & SERVICES VIDEO LAZY LOADING (INTERSECTION OBSERVER)
    // ==========================================================================
    const initializeLazyVideos = () => {
        const lazyVideos = document.querySelectorAll('.lazy-video');
        
        if (lazyVideos.length === 0) return;
        
        const playVisibleVideos = () => {
            lazyVideos.forEach(video => {
                if (video.dataset.visible === 'true' && video.paused) {
                    // 🔒 SEGURANÇA & COMPATIBILIDADE: Força carga do buffer no Safari iOS se não iniciado
                    if (video.readyState === 0) {
                        video.load();
                    }
                    video.play().catch(err => {
                        console.log("[KF Studio AppSec] Toque móvel tentou reproduzir mas falhou:", err.message);
                    });
                }
            });
        };
        
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    
                    if (entry.isIntersecting) {
                        video.dataset.visible = 'true';
                        // O vídeo está visível -> Carrega e tenta reproduzir
                        if (video.paused) {
                            // 🔒 SEGURANÇA & COMPATIBILIDADE: Força carga do buffer se não iniciado (readyState HAVE_NOTHING)
                            if (video.readyState === 0) {
                                video.load();
                            }
                            video.play().catch(err => {
                                console.log("[KF Studio AppSec] Reprodução automática de vídeo secundário bloqueada. Aguardando interação:", err.message);
                            });
                        }
                    } else {
                        video.dataset.visible = 'false';
                        // O vídeo saiu da tela -> Pausa imediatamente para poupar CPU/GPU
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '50px 0px 50px 0px' // Margem para carregar um pouco antes de entrar
            });
            
            lazyVideos.forEach(video => {
                video.dataset.visible = 'false';
                videoObserver.observe(video);
            });
        } else {
            // Fallback completo se sem suporte a IntersectionObserver
            lazyVideos.forEach(video => {
                video.setAttribute('preload', 'auto');
                video.play().catch(() => {});
            });
        }
        
        // Ativação por gesto do usuário (liberação de autoplay bloqueado no mobile)
        window.addEventListener('scroll', playVisibleVideos, { passive: true });
        window.addEventListener('click', playVisibleVideos, { passive: true });
        window.addEventListener('touchstart', playVisibleVideos, { passive: true });
    };
    
    initializeLazyVideos();

});
