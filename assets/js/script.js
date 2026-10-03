    // Ждем полной загрузки DOM
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.getElementById('primary-menu');
        const menuBackdrop = document.querySelector('.menu-backdrop');
        const body = document.body;

        // 1. Проверка: нашли ли мы кнопку?
        if (!themeToggle) {
            return;
        }

        // 2. Проверяем сохраненную тему в памяти (тёмная теперь по умолчанию)
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            body.classList.remove('dark-theme');
        }

        // 3. Обработчик клика
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');

            // Сохраняем выбор
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });

        if (menuToggle && navMenu) {
            const mobileMenuQuery = window.matchMedia('(max-width: 768px)');

            const setMenuState = (isOpen, restoreFocus = false) => {
                navMenu.classList.remove('is-open');
                navMenu.toggleAttribute('inert', !isOpen);
                navMenu.setAttribute('aria-hidden', String(!isOpen));
                menuToggle.setAttribute('aria-expanded', String(isOpen));
                menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');

                if (isOpen) {
                    navMenu.classList.add('is-open');
                }

                if (menuBackdrop) {
                    menuBackdrop.classList.toggle('is-visible', isOpen);
                    menuBackdrop.setAttribute('aria-hidden', String(!isOpen));
                }

                if (restoreFocus) menuToggle.focus();
            };

            const syncMenuWithViewport = () => {
                if (mobileMenuQuery.matches) {
                    setMenuState(false);
                } else {
                    navMenu.classList.remove('is-open');
                    navMenu.removeAttribute('aria-hidden');
                    navMenu.removeAttribute('inert');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.setAttribute('aria-label', 'Открыть меню');
                    if (menuBackdrop) {
                        menuBackdrop.classList.remove('is-visible');
                        menuBackdrop.setAttribute('aria-hidden', 'true');
                    }
                }
            };

            const closeMenu = (restoreFocus = false) => setMenuState(false, restoreFocus);

            syncMenuWithViewport();

            menuToggle.addEventListener('click', () => {
                setMenuState(!navMenu.classList.contains('is-open'));
            });

            navMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    if (mobileMenuQuery.matches) closeMenu();
                });
            });

            menuBackdrop?.addEventListener('click', () => closeMenu(true));

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
                    closeMenu(true);
                }
            });

            mobileMenuQuery.addEventListener('change', syncMenuWithViewport);
        }
    });

    function openLivePreview(id) {
        const overlay = document.getElementById('lp-' + id);
        if (!overlay) return;

        // Добавляем хэш в историю браузера, чтобы работала системная кнопка "Назад"
        window.history.pushState({ modalOpen: true }, '', `#${id}`);

        overlay.style.display = 'block';
        overlay.scrollTop = 0;
        document.documentElement.style.overflow = 'hidden';
        overlay.offsetHeight;
        overlay.classList.add('is-open');
        const closeBtn = overlay.querySelector('.lp-close-btn');
        if (closeBtn) closeBtn.focus();
    }

    function closeLivePreview(id, fromPopState = false) {
        const overlay = document.getElementById('lp-' + id);
        if (!overlay) return;

        overlay.classList.remove('is-open');
        setTimeout(() => {
            overlay.style.display = 'none';
            document.documentElement.style.overflow = '';
        }, 350);

        // Если закрываем по крестику/кнопке, а не через системную кнопку "Назад", откатываем историю
        if (!fromPopState && window.location.hash === `#${id}`) {
            window.history.back();
        }
    }

    // Слушаем событие кнопки "Назад" (и "Вперед") в браузере
    window.addEventListener('popstate', (e) => {
        const openModal = document.querySelector('.lp-overlay.is-open');
        if (openModal) {
            const id = openModal.id.replace('lp-', '');
            // Закрываем окно, передаем true, чтобы не вызвать history.back() еще раз
            closeLivePreview(id, true);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const open = document.querySelector('.lp-overlay.is-open');
            if (open) closeLivePreview(open.id.replace('lp-', ''));
        }
    });

    
