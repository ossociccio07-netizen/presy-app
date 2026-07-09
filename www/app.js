/* ═══════════════════════════════════════════════════════════
   PRESY — Interactive Prototype (Vanilla JS)
   Bilingual IT/EN · Dynamic state · LocalStorage guest ID
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Localization ─────────────────────────────────────── */

  const i18n = {
    it: {
      pageTitle: 'Presy — Organizzatore Pre-Party',
      hostBadge: 'Host',
      tabCreate: 'Crea',
      tabShop: 'Lista',
      tabSettle: 'Paga',
      tabsAria: 'Schermate Presy',

      createTitle: 'Crea un Presy',
      createSubtitle: 'Imposta il vibe. Invita la amici. Dividi equo.',
      vibeLabel: 'Qual è il vibe stasera?',
      vibePlaceholder: 'Warmup del Sabato 🚀',
      participants: 'Partecipanti',
      joined: '{n} iscritti',
      you: 'Tu',
      hostTag: 'Host',
      joinedAgo: 'Iscritto {n}m fa',
      quickAddPlaceholder: 'Aggiungi nome…',
      quickAddAria: 'Aggiungi partecipante',
      createPresy: 'Crea Presy',
      inviteFriends: 'Invita Amici',
      inviteHint: 'Genera un link WhatsApp — gli ospiti entrano con un tap.',

      shoppingTitle: 'Lista della Spesa',
      shoppingSubtitle: 'Tocca + per aggiungere. Tutti lo vedono live.',
      totalEst: 'Totale Stim.',
      perPerson: 'A Persona',
      calcMeta: '{items} articoli · {people} persone · Aggiornamento live',
      addedBy: 'Aggiunto da {name}',
      decrease: 'Diminuisci {name}',
      increase: 'Aumenta {name}',
      addCustomItem: 'Aggiungi Articolo',

      checkoutTitle: 'Checkout',
      checkoutSubtitle: 'Inserisci il totale reale. Chiudi i conti in secondi.',
      receiptLabel: 'Totale Scontrino Esatto',
      uploadReceipt: 'Carica Foto Scontrino',
      uploadHint: 'Tocca per scattare o scegli dalla galleria',
      settlementLedger: 'Registro Pagamenti',
      paidCount: '{paid} / {total} pagati',
      owes: 'deve {amount}',
      settled: 'pagato',
      markPaid: 'Segna come Pagato',
      markUnpaid: 'Segna come Non Pagato',
      owesAria: 'Deve pagare',
      settledAria: 'Ha pagato',

      noctEyebrow: 'Dove andiamo dopo? 🚀',
      noctBrand: 'Powered by',
      noctEvent: 'NEON NIGHTS @ Fabric',
      noctDetails: 'Sab 12 Lug · 23:00 · €18 early bird',
      trending: '🔥 Trending',
      nearby: '📍 1.2 km',
      bookTickets: 'Prenota Biglietti',

      drinks: {
        vodka: 'Vodka',
        gin: 'Gin',
        redbull: 'Red Bull',
        lemon: 'Limone',
        ice: 'Ghiaccio',
        soda: 'Soda'
      },

      whatsappMsg: 'Entra nel mio Presy "{name}"! 🎉\n{url}'
    },
    en: {
      pageTitle: 'Presy — Pre-Party Organizer',
      hostBadge: 'Host',
      tabCreate: 'Create',
      tabShop: 'Shop',
      tabSettle: 'Settle',
      tabsAria: 'Presy screens',

      createTitle: 'Create a Presy',
      createSubtitle: 'Set the vibe. Invite the amici. Split it fair.',
      vibeLabel: "What's the vibe tonight?",
      vibePlaceholder: 'Saturday Warmup 🚀',
      participants: 'Participants',
      joined: '{n} joined',
      you: 'You',
      hostTag: 'Host',
      joinedAgo: 'Joined {n}m ago',
      quickAddPlaceholder: 'Quick add name…',
      quickAddAria: 'Add participant',
      createPresy: 'Create Presy',
      inviteFriends: 'Invite Friends',
      inviteHint: 'Generates a WhatsApp link — guests just tap & join.',

      shoppingTitle: 'Shopping List',
      shoppingSubtitle: 'Tap + to add. Everyone sees it live.',
      totalEst: 'Total Est.',
      perPerson: 'Per Person',
      calcMeta: '{items} items · {people} people · Live updating',
      addedBy: 'Added by {name}',
      decrease: 'Decrease {name}',
      increase: 'Increase {name}',
      addCustomItem: 'Add Custom Item',

      checkoutTitle: 'Checkout',
      checkoutSubtitle: 'Enter the real total. Settle up in seconds.',
      receiptLabel: 'Exact Receipt Total',
      uploadReceipt: 'Upload Receipt Photo',
      uploadHint: 'Tap to snap or choose from gallery',
      settlementLedger: 'Settlement Ledger',
      paidCount: '{paid} / {total} paid',
      owes: 'owes {amount}',
      settled: 'settled up',
      markPaid: 'Mark as Paid',
      markUnpaid: 'Mark as Unpaid',
      owesAria: 'Owes money',
      settledAria: 'Settled up',

      noctEyebrow: 'Where to next? 🚀',
      noctBrand: 'Powered by',
      noctEvent: 'NEON NIGHTS @ Fabric',
      noctDetails: 'Sat 12 Jul · 23:00 · €18 early bird',
      trending: '🔥 Trending',
      nearby: '📍 1.2 km',
      bookTickets: 'Book Tickets',

      drinks: {
        vodka: 'Vodka',
        gin: 'Gin',
        redbull: 'Red Bull',
        lemon: 'Lemon',
        ice: 'Ice',
        soda: 'Soda'
      },

      whatsappMsg: 'Join my Presy "{name}"! 🎉\n{url}'
    }
  };

  const DRINK_PRESETS = [
    { id: 'vodka', icon: '🍸', iconClass: 'drink-icon--vodka', price: 12.0, qty: 2, addedBy: 'Marco' },
    { id: 'gin', icon: '🍹', iconClass: 'drink-icon--gin', price: 14.0, qty: 1, addedBy: 'Sofia' },
    { id: 'redbull', icon: '⚡', iconClass: 'drink-icon--redbull', price: 8.0, qty: 4, addedBy: 'Luca' },
    { id: 'lemon', icon: '🍋', iconClass: 'drink-icon--lemon', price: 3.0, qty: 2, addedBy: 'Elena' },
    { id: 'ice', icon: '🧊', iconClass: 'drink-icon--ice', price: 2.0, qty: 1, addedBy: 'Alex' },
    { id: 'soda', icon: '🥤', iconClass: 'drink-icon--soda', price: 1.5, qty: 6, addedBy: 'Marco' }
  ];

  const BADGE_CLASS = {
    Marco: 'badge--marco',
    Sofia: 'badge--sofia',
    Luca: 'badge--luca',
    Elena: 'badge--elena',
    Alex: 'badge--alex'
  };

  let currentLang = localStorage.getItem('presy_lang') || 'it';

  const state = {
    partyActive: false,
    vibeName: 'Warmup del Sabato 🚀',
    receiptTotal: 43.8,
    venueClicked: false,
    drinks: DRINK_PRESETS.map(function (d) { return Object.assign({}, d); }),
    guests: [
      { id: 'g1', name: 'Marco', isHost: true, joinedMinutes: 0, paid: false },
      { id: 'g2', name: 'Sofia', isHost: false, joinedMinutes: 2, paid: true },
      { id: 'g3', name: 'Luca', isHost: false, joinedMinutes: 5, paid: false },
      { id: 'g4', name: 'Elena', isHost: false, joinedMinutes: 8, paid: true },
      { id: 'g5', name: 'Alex', isHost: false, joinedMinutes: 12, paid: false }
    ]
  };

  /* Guest LocalStorage UUID (anonymous tracking prototype) */
  if (!localStorage.getItem('presy_guest_uuid')) {
    localStorage.setItem('presy_guest_uuid', crypto.randomUUID());
  }

  /* ─── Helpers ──────────────────────────────────────────── */

  function t(key, vars) {
    vars = vars || {};
    var keys = key.split('.');
    var val = i18n[currentLang];
    for (var i = 0; i < keys.length; i++) {
      val = val && val[keys[i]];
    }
    if (typeof val !== 'string') return key;
    return val.replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] !== undefined ? vars[k] : '{' + k + '}';
    });
  }

  function formatEuro(amount) {
    return '€' + amount.toFixed(2);
  }

  function getEstimatedTotal() {
    return state.drinks.reduce(function (sum, d) {
      return sum + d.price * d.qty;
    }, 0);
  }

  function getTotalItems() {
    return state.drinks.reduce(function (sum, d) {
      return sum + d.qty;
    }, 0);
  }

  function getSplitAmount(total) {
    var count = state.guests.length;
    return count > 0 ? total / count : 0;
  }

  function getPaidCount() {
    return state.guests.filter(function (g) { return g.paid; }).length;
  }

  function initial(name) {
    return name.charAt(0).toUpperCase();
  }

  /* ─── i18n DOM Apply ───────────────────────────────────── */

  function applyTranslations() {
    document.title = t('pageTitle');
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var html = el.getAttribute('data-i18n-html') === 'true';
      if (html) {
        el.innerHTML = t(key);
      } else {
        el.textContent = t(key);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    updateLangSwitcher();
    renderParticipants();
    renderDrinkList();
    renderCalc();
    renderLedger();
  }

  function updateLangSwitcher() {
    document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
      var lang = btn.dataset.lang;
      btn.classList.toggle('lang-switch__btn--active', lang === currentLang);
      btn.setAttribute('aria-pressed', lang === currentLang ? 'true' : 'false');
    });
  }

  function setLanguage(lang) {
    if (!i18n[lang]) return;
    currentLang = lang;
    localStorage.setItem('presy_lang', lang);
    applyTranslations();
  }

  /* ─── Tab Navigation ───────────────────────────────────── */

  function switchTab(tabId) {
    document.querySelectorAll('.tabs__btn').forEach(function (tab) {
      var active = tab.dataset.tab === tabId;
      tab.classList.toggle('tabs__btn--active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('.screen').forEach(function (screen) {
      var active = screen.id === 'screen-' + tabId;
      screen.classList.toggle('screen--active', active);
      screen.hidden = !active;
    });
  }

  /* ─── Render: Participants ───────────────────────────────── */

  function renderParticipants() {
    var list = document.getElementById('participant-list');
    var countEl = document.getElementById('participant-count');
    if (!list) return;

    countEl.textContent = t('joined', { n: state.guests.length });

    list.innerHTML = state.guests.map(function (guest) {
      var hostTag = guest.isHost
        ? ' <span class="tag tag--host">' + t('hostTag') + '</span>'
        : '';
      var meta = guest.isHost
        ? t('you')
        : t('joinedAgo', { n: guest.joinedMinutes });

      return (
        '<li class="participant">' +
          '<span class="avatar' + (guest.isHost ? ' avatar--host' : '') + '">' + initial(guest.name) + '</span>' +
          '<div class="participant__info">' +
            '<span class="participant__name">' + guest.name + hostTag + '</span>' +
            '<span class="participant__meta">' + meta + '</span>' +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  /* ─── Render: Shopping List & Calculator ───────────────── */

  function renderCalc() {
    var total = getEstimatedTotal();
    var split = getSplitAmount(total);
    var items = getTotalItems();

    var totalEl = document.getElementById('calc-total');
    var splitEl = document.getElementById('calc-split');
    var metaEl = document.getElementById('calc-meta');

    if (totalEl) totalEl.textContent = formatEuro(total);
    if (splitEl) splitEl.textContent = formatEuro(split);
    if (metaEl) {
      metaEl.textContent = t('calcMeta', {
        items: items,
        people: state.guests.length
      });
    }
  }

  function renderDrinkList() {
    var list = document.getElementById('drink-list');
    if (!list) return;

    list.innerHTML = state.drinks.map(function (drink, index) {
      var drinkName = t('drinks.' + drink.id);
      var badgeClass = BADGE_CLASS[drink.addedBy] || 'badge--marco';

      return (
        '<li class="drink-item glass-card" data-drink-index="' + index + '">' +
          '<span class="drink-icon ' + drink.iconClass + '" aria-hidden="true">' + drink.icon + '</span>' +
          '<div class="drink-item__body">' +
            '<span class="drink-item__name">' + drinkName + '</span>' +
            '<span class="drink-item__price">' + formatEuro(drink.price) + '</span>' +
            '<span class="badge ' + badgeClass + '">' + t('addedBy', { name: drink.addedBy }) + '</span>' +
          '</div>' +
          '<div class="counter">' +
            '<button type="button" class="counter__btn" data-action="decrease" data-index="' + index + '" aria-label="' + t('decrease', { name: drinkName }) + '">−</button>' +
            '<span class="counter__value" id="qty-' + index + '">' + drink.qty + '</span>' +
            '<button type="button" class="counter__btn counter__btn--plus" data-action="increase" data-index="' + index + '" aria-label="' + t('increase', { name: drinkName }) + '">+</button>' +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  /* ─── Render: Settlement Ledger ────────────────────────── */

  function renderLedger() {
    var list = document.getElementById('ledger-list');
    var countEl = document.getElementById('ledger-paid-count');
    if (!list) return;

    var split = getSplitAmount(state.receiptTotal);
    var paid = getPaidCount();

    if (countEl) {
      countEl.textContent = t('paidCount', {
        paid: paid,
        total: state.guests.length
      });
    }

    list.innerHTML = state.guests.map(function (guest) {
      var settled = guest.paid;
      var dotClass = settled ? 'status-dot--paid' : 'status-dot--owed';
      var amountClass = settled ? 'ledger-item__amount--paid' : 'ledger-item__amount--owed';
      var amountText = settled
        ? t('settled')
        : t('owes', { amount: formatEuro(split) });
      var ariaLabel = settled ? t('settledAria') : t('owesAria');

      var actionHtml;
      if (settled) {
        actionHtml =
          '<button type="button" class="btn btn--sm btn--outline-green" data-guest-id="' + guest.id + '" data-action="toggle-paid">' +
            t('markUnpaid') +
          '</button>';
      } else {
        actionHtml =
          '<button type="button" class="btn btn--sm btn--outline" data-guest-id="' + guest.id + '" data-action="toggle-paid">' +
            t('markPaid') +
          '</button>';
      }

      return (
        '<li class="ledger-item' + (settled ? ' ledger-item--settled' : '') + '" data-guest-id="' + guest.id + '">' +
          '<span class="status-dot ' + dotClass + '" aria-label="' + ariaLabel + '"></span>' +
          '<div class="ledger-item__body">' +
            '<span class="ledger-item__name">' + guest.name + '</span>' +
            '<span class="ledger-item__amount ' + amountClass + '">' + amountText + '</span>' +
          '</div>' +
          actionHtml +
        '</li>'
      );
    }).join('');
  }

  /* ─── Event Handlers ───────────────────────────────────── */

  function bindEvents() {
    /* Language switch */
    document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
      });
    });

    /* Tabs */
    document.querySelectorAll('.tabs__btn').forEach(function (tab) {
      tab.addEventListener('click', function () {
        switchTab(tab.dataset.tab);
      });
    });

    /* Vibe input */
    var vibeInput = document.getElementById('vibe-input');
    if (vibeInput) {
      if (currentLang === 'it') {
        vibeInput.value = state.vibeName;
      } else {
        vibeInput.value = 'Saturday Warmup 🚀';
      }
      vibeInput.addEventListener('input', function () {
        state.vibeName = vibeInput.value;
      });
    }

    /* Create Presy */
    document.getElementById('btn-create-presy').addEventListener('click', function () {
      state.partyActive = true;
      state.vibeName = vibeInput.value.trim() || t('vibePlaceholder');
      switchTab('shopping');
    });

    /* Invite Friends (WhatsApp) */
    document.getElementById('btn-invite').addEventListener('click', function () {
      var url = window.location.href.split('?')[0] + '?party=demo';
      var msg = t('whatsappMsg', { name: state.vibeName, url: url });
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    });

    /* Quick add participant */
    document.getElementById('btn-quick-add').addEventListener('click', addParticipant);
    document.getElementById('quick-add-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addParticipant();
    });

    /* Drink counters (delegated) */
    document.getElementById('drink-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var index = parseInt(btn.dataset.index, 10);
      var action = btn.dataset.action;
      if (action === 'increase') {
        state.drinks[index].qty += 1;
      } else if (action === 'decrease' && state.drinks[index].qty > 0) {
        state.drinks[index].qty -= 1;
      }
      renderDrinkList();
      renderCalc();
    });

    /* Receipt total */
    var receiptInput = document.getElementById('receipt-total');
    receiptInput.value = state.receiptTotal;
    receiptInput.addEventListener('input', function () {
      var val = parseFloat(receiptInput.value);
      state.receiptTotal = isNaN(val) || val < 0 ? 0 : val;
      renderLedger();
    });

    /* Ledger toggle (delegated) */
    document.getElementById('ledger-list').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="toggle-paid"]');
      if (!btn) return;
      var guestId = btn.dataset.guestId;
      var guest = state.guests.find(function (g) { return g.id === guestId; });
      if (guest) {
        guest.paid = !guest.paid;
        renderLedger();
      }
    });

    /* NOCT conversion tracking */
    document.getElementById('btn-noct').addEventListener('click', function () {
      state.venueClicked = true;
      console.info('[Presy Analytics] target_venue_clicked:', true);
    });

    /* Receipt upload feedback */
    document.getElementById('receipt-upload').addEventListener('change', function (e) {
      var zone = document.querySelector('.upload-zone__text');
      if (e.target.files && e.target.files[0] && zone) {
        zone.textContent = e.target.files[0].name;
      }
    });
  }

  function addParticipant() {
    var input = document.getElementById('quick-add-input');
    var name = input.value.trim();
    if (!name) return;

    state.guests.push({
      id: 'g' + Date.now(),
      name: name,
      isHost: false,
      joinedMinutes: 0,
      paid: false
    });

    input.value = '';
    renderParticipants();
    renderCalc();
    renderLedger();
  }

  /* ─── Init ─────────────────────────────────────────────── */

  function init() {
    applyTranslations();
    bindEvents();
    renderCalc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
