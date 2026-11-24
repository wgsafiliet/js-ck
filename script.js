
  let selectedPackage = JSON.parse(localStorage.getItem('wgs_selected_package')) || {
    name: "SheetsPress Paket 10 Website (Agency)", price: 99000, isCustom: false
  };

  let basePrice = selectedPackage.price || 99000;
  const extensionPrice = 99000; // Biaya perpanjangan TAHUNAN (hanya Personal)
  let currentYears = 1; // 1=Personal (tahunan), 2=PRO (lifetime), 3=VIP (lifetime)

  // Harga lifetime tetap untuk PRO & VIP (bayar sekali, lisensi selamanya)
  const PRO_LIFETIME_PRICE = 198000;
  const VIP_LIFETIME_PRICE = 297000;

  const TIER_LEVELS = { personal: 1, pro: 2, vip: 3 };
  const TIER_NAMES = { 1: 'Personal', 2: 'PRO', 3: 'VIP' };
  const TIER_TYPE = { 1: 'Tahunan', 2: 'Lifetime', 3: 'Lifetime' }; // tipe lisensi

  const TIER_DETAILS = {
    personal: {
      title: 'Apa itu Personal?',
      desc: 'Tier dasar dengan lisensi TAHUNAN untuk penggunaan pribadi atau UMKM yang baru memulai. Cocok untuk pemula, freelancer tunggal, atau content creator yang masih membangun bisnisnya. Lisensi berlaku 1 tahun dan dapat diperpanjang.',
      includes: [
        'Akses 9 produk AI kategori Personal',
        'Lisensi 1 tahun untuk 1 pengguna',
        'Biaya perpanjangan flat Rp 99.000/tahun',
        'Update fitur dasar berkala',
        'Bantuan instalasi gratis dari tim teknis',
        'Akses komunitas pengguna SheetsPress'
      ]
    },
    pro: {
      title: 'Apa itu PRO?',
      desc: 'Tier profesional dengan lisensi LIFETIME (unlimited). Bayar sekali, lisensi berlaku selamanya tanpa biaya perawatan tahunan. Mencakup semua produk Personal + 4 produk PRO dengan kapasitas dan fitur lebih besar.',
      includes: [
        'Semua fitur tier Personal',
        'Akses 13 produk AI (Personal + PRO)',
        'Lisensi LIFETIME — bayar sekali, selamanya',
        'Tanpa biaya perawatan tahunan',
        'Tools AI lanjutan untuk skala produksi',
        'Prioritas dukungan teknis'
      ]
    },
    vip: {
      title: 'Apa itu VIP?',
      desc: 'Tier tertinggi dengan lisensi LIFETIME (unlimited) dan akses penuh seluruh 18 produk AI tanpa batas. Bayar sekali, lisensi selamanya. Cocok untuk agency, reseller, atau bisnis skala besar. Mencakup semua fitur PRO + 5 produk VIP eksklusif.',
      includes: [
        'Semua fitur tier PRO',
        'Akses penuh 18 produk AI (semua tier)',
        'Lisensi LIFETIME — bayar sekali, selamanya',
        'Tanpa biaya perawatan tahunan',
        '5 produk VIP eksklusif (video, extensi, dll)',
        'White label & komersial penuh',
        'Prioritas support tertinggi'
      ]
    }
  };

  let domainPricePerYear = 0;
  let domainYears = 1;
  let isDomainAdded = false;
  let currentDomainName = '';

  function formatRupiah(num) { return 'Rp ' + num.toLocaleString('id-ID'); }

  // === Hitung harga lisensi per tier ===
  // Personal (1): tahunan -> basePrice (Rp 99.000)
  // PRO (2):      lifetime -> PRO_LIFETIME_PRICE (Rp 198.000)
  // VIP (3):      lifetime -> VIP_LIFETIME_PRICE (Rp 297.000)
  function getLicensePriceForTier(tierLevel) {
    let final, original = 0, discountRate = 0, discountAmount = 0;
    if (tierLevel === 1) {
      final = basePrice; // Personal tahunan
    } else if (tierLevel === 2) {
      final = PRO_LIFETIME_PRICE; // PRO lifetime
    } else {
      final = VIP_LIFETIME_PRICE; // VIP lifetime
    }
    return { original, discountRate, discountAmount, final };
  }

  // Alias agar pemanggilan lama tetap jalan
  const getLicensePriceForYears = getLicensePriceForTier;

  function calculateTotal() {
    if (selectedPackage.isCustom) {
      document.getElementById('hostingPriceText').textContent = 'Custom';
      document.getElementById('subtotalText').textContent = 'Custom';
      document.getElementById('totalPrice').textContent = 'Custom';
      document.getElementById('ppnRow').style.display = 'none';
      document.getElementById('durationDiscountRow').style.display = 'none';
      return;
    }
    const lic = getLicensePriceForTier(currentYears);
    document.getElementById('hostingPriceText').textContent = formatRupiah(lic.final);
    document.getElementById('hostingLabel').textContent = selectedPackage.name + ' (' + TIER_NAMES[currentYears] + ' — ' + TIER_TYPE[currentYears] + ')';
    // Tidak ada baris diskon durasi (PRO/VIP lifetime = harga tetap, Personal tahunan tanpa diskon)
    document.getElementById('durationDiscountRow').style.display = 'none';
    let totalDomainPrice = isDomainAdded ? (domainPricePerYear * domainYears) : 0;
    let subtotal = lic.final + totalDomainPrice;
    let ppn = Math.round(subtotal * 0.11);
    let total = subtotal + ppn;
    document.getElementById('subtotalText').textContent = formatRupiah(subtotal);
    document.getElementById('ppnText').textContent = formatRupiah(ppn);
    document.getElementById('totalPrice').textContent = formatRupiah(total);
    // Update banner renewal sesuai tipe lisensi
    updateRenewalBanner();
  }

  // === Update banner perawatan sesuai tier ===
  // Personal (tahunan): tampilkan info perpanjangan
  // PRO/VIP (lifetime): ganti jadi konfirmasi tanpa biaya perawatan
  function updateRenewalBanner() {
    const banner = document.getElementById('renewalBanner');
    const title = document.getElementById('renewalTitle');
    const subtitle = document.getElementById('renewalSubtitle');
    if (!banner) return;
    if (currentYears === 1) {
      banner.style.display = 'flex';
      banner.style.background = 'var(--app-orange-light)';
      banner.style.borderLeftColor = 'var(--app-orange)';
      title.style.color = '#9A3412';
      subtitle.style.color = '#C2410C';
      title.textContent = 'Lisensi Tahunan — Perlu Perpanjangan';
      subtitle.innerHTML = 'Member <strong>Personal</strong> berlaku 1 tahun. Setelah itu, biaya perawatan <strong>flat Rp 99.000/tahun</strong> untuk memperpanjang lisensi paket ini.';
    } else {
      banner.style.display = 'flex';
      banner.style.background = 'var(--app-accent-light)';
      banner.style.borderLeftColor = 'var(--brand)';
      title.style.color = 'var(--brand-dark)';
      subtitle.style.color = '#065f46';
      title.textContent = 'Lisensi Lifetime — Bayar Sekali, Selamanya';
      subtitle.innerHTML = 'Member <strong>' + TIER_NAMES[currentYears] + '</strong> berlaku seumur hidup tanpa biaya perawatan tahunan. Anda hanya bayar sekali di awal.';
    }
  }

  function getPackageDescription(pkg) {
    if (!pkg || !pkg.name) return 'Lisensi SheetsPress';
    if (pkg.isCustom) return 'Kebutuhan khusus & SaaS skala besar';
    const name = pkg.name.toLowerCase();
    if (name.includes('10 website') || name.includes('agency')) return 'White Label Admin Panel';
    if (name.includes('3 website') || name.includes('pro')) return 'Hemat untuk multiple brand';
    if (name.includes('1 website') || name.includes('starter')) return 'Cocok untuk personal & UMKM baru';
    return 'Lisensi SheetsPress';
  }

  function updatePackageUI() {
    document.getElementById('pkgName').textContent = selectedPackage.name;
    document.getElementById('pkgBasePriceText').textContent = selectedPackage.isCustom ? 'Custom' : formatRupiah(basePrice);
    const descEl = document.getElementById('pkgDesc');
    if (descEl) descEl.textContent = getPackageDescription(selectedPackage);
    const d1 = getLicensePriceForTier(1), d2 = getLicensePriceForTier(2), d3 = getLicensePriceForTier(3);
    document.getElementById('dur1Price').textContent = formatRupiah(d1.final);
    document.getElementById('dur2Price').textContent = formatRupiah(d2.final);
    document.getElementById('dur3Price').textContent = formatRupiah(d3.final);
    if (selectedPackage.isCustom) {
      document.querySelector('.dur-group').style.display = 'none';
      document.querySelector('.renewal-banner').style.display = 'none';
      document.getElementById('hostingPriceText').textContent = 'Custom';
    }
  }

  // === LOGIKA TIER: kunci item yang tier-nya lebih tinggi dari tier dipilih ===
  function applyTierLocks() {
    const selectedLevel = currentYears;
    const items = document.querySelectorAll('.bonus-item[data-tier]');
    let activeCount = 0;
    items.forEach(item => {
      const itemTier = item.getAttribute('data-tier');
      const itemLevel = TIER_LEVELS[itemTier] || 1;
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (itemLevel > selectedLevel) {
        item.classList.add('locked');
        checkbox.checked = false;
        checkbox.disabled = true;
      } else {
        item.classList.remove('locked');
        checkbox.disabled = false;
        checkbox.checked = true;
        activeCount++;
      }
    });
    const countEl = document.getElementById('bonusActiveCount');
    if (countEl) countEl.textContent = activeCount;
    const tierNameEl = document.getElementById('currentTierName');
    if (tierNameEl) tierNameEl.textContent = TIER_NAMES[selectedLevel];
  }

  const durButtons = document.querySelectorAll('.dur-btn');
  durButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      durButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentYears = parseInt(btn.getAttribute('data-years'));
      applyTierLocks();
      calculateTotal();
    });
  });

  document.getElementById('bonusList').addEventListener('click', (e) => {
    const item = e.target.closest('.bonus-item');
    if (!item) return;
    if (item.classList.contains('locked')) { e.preventDefault(); e.stopPropagation(); }
    if (e.target.closest('.bonus-val')) { e.preventDefault(); e.stopPropagation(); }
  });

  document.getElementById('domainDurationSelect').addEventListener('change', (e) => {
    domainYears = parseInt(e.target.value);
    if (isDomainAdded) {
      document.getElementById('domainNameText').textContent = `Domain ${currentDomainName} (${domainYears} Tahun)`;
      document.getElementById('domainPriceText').textContent = formatRupiah(domainPricePerYear * domainYears);
    }
    document.querySelectorAll('.tld-row').forEach(row => {
      if (row.classList.contains('taken')) return;
      const promoEl = row.querySelector('.tld-row-price-promo');
      const origEl = row.querySelector('.tld-row-price-original');
      if (promoEl && origEl) {
        const promo = parseInt(promoEl.dataset.promo);
        const original = parseInt(origEl.dataset.original);
        promoEl.textContent = formatRupiah(promo * domainYears);
        origEl.textContent = formatRupiah(original * domainYears);
      }
    });
    if (isDomainAdded) calculateTotal();
  });

  async function checkDomainAvailability() {
    const domainNameInput = document.getElementById('domainNameInput');
    const domainDurationSelect = document.getElementById('domainDurationSelect');
    const domainResult = document.getElementById('domainResult');
    const btnCheckDomain = document.getElementById('btnCheckDomain');
    const domainName = domainNameInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!domainName) {
      domainNameInput.classList.add('input-error');
      setTimeout(() => domainNameInput.classList.remove('input-error'), 1500);
      domainNameInput.focus();
      return;
    }
    domainYears = parseInt(domainDurationSelect.value);
    btnCheckDomain.disabled = true;
    btnCheckDomain.innerHTML = '<svg class="animate-spin" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Mengecek...';
    domainResult.className = 'domain-result-modern show loading';
    domainResult.innerHTML = 'Mengecek ketersediaan domain untuk <strong>' + domainName + '</strong>...';
    removeDomainFromCart(true);

    const tlds = [
      { tld: '.com', promo: 150000, original: 209000 },
      { tld: '.id', promo: 225000, original: 249000 },
      { tld: '.my.id', promo: 15000, original: 35000 },
      { tld: '.web.id', promo: 15000, original: 55000 },
      { tld: '.biz.id', promo: 15000, original: 70000 }
    ];
    const promises = tlds.map(async (item) => {
      const domain = `${domainName}${item.tld}`;
      try {
        const res = await fetch(`https://rdap.org/domain/${domain}`);
        return { ...item, domain, isAvailable: (res.status === 404) };
      } catch (e) { return { ...item, domain, isAvailable: false }; }
    });
    const results = await Promise.all(promises);

    let html = '<div class="tld-list-modern">';
    results.forEach(item => {
      if (item.isAvailable) {
        html += `<div class="tld-row" data-domain="${item.domain}">
          <div class="tld-row-info">
            <span class="tld-row-name">${item.domain}</span>
            <div class="tld-row-price">
              <span class="tld-row-price-promo" data-promo="${item.promo}">${formatRupiah(item.promo * domainYears)}</span>
              <span class="tld-row-price-original" data-original="${item.original}">${formatRupiah(item.original * domainYears)}</span>
            </div>
          </div>
          <div class="tld-row-action">
            <button class="btn-add-tld-modern" data-domain="${item.domain}" data-price="${item.promo}" onclick="addDomainToCart('${item.domain}', ${item.promo})">+ Tambah</button>
          </div>
        </div>`;
      } else {
        html += `<div class="tld-row taken">
          <div class="tld-row-info">
            <span class="tld-row-name">${item.domain}</span>
            <span class="tld-row-taken-label">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Terpakai
            </span>
          </div>
        </div>`;
      }
    });
    html += '</div>';
    domainResult.className = 'domain-result-modern show';
    domainResult.innerHTML = html;
    btnCheckDomain.disabled = false;
    btnCheckDomain.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Cek';
  }

  window.addDomainToCart = function(domainName, pricePerYear) {
    isDomainAdded = true;
    currentDomainName = domainName;
    domainPricePerYear = pricePerYear;
    document.getElementById('domainRowWrapper').style.display = 'flex';
    document.getElementById('domainNameText').textContent = `Domain ${currentDomainName} (${domainYears} Tahun)`;
    document.getElementById('domainPriceText').textContent = formatRupiah(domainPricePerYear * domainYears);
    calculateTotal();
    document.querySelectorAll('.tld-row').forEach(row => {
      if (row.classList.contains('taken')) return;
      const rowDomain = row.getAttribute('data-domain');
      const btn = row.querySelector('.btn-add-tld-modern');
      if (!btn) return;
      if (rowDomain === domainName) {
        row.classList.add('selected');
        btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Ditambahkan';
        btn.classList.add('added');
      } else {
        row.classList.remove('selected');
        btn.innerHTML = '+ Tambah';
        btn.classList.remove('added');
      }
    });
  }

  window.removeDomainFromCart = function(isSilent = false) {
    isDomainAdded = false;
    currentDomainName = '';
    document.getElementById('domainRowWrapper').style.display = 'none';
    calculateTotal();
    if (!isSilent) {
      document.querySelectorAll('.tld-row').forEach(row => {
        if (row.classList.contains('taken')) return;
        row.classList.remove('selected');
        const btn = row.querySelector('.btn-add-tld-modern');
        if (btn) { btn.innerHTML = '+ Tambah'; btn.classList.remove('added'); }
      });
    }
  }

  document.getElementById('btnCheckDomain').addEventListener('click', checkDomainAvailability);
  document.getElementById('domainNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); checkDomainAvailability(); }
  });

  // ===== MODAL TIER =====
  window.openTierModal = function(tier, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const data = TIER_DETAILS[tier];
    if (!data) return;
    const label = tier === 'personal' ? 'Personal' : tier === 'pro' ? 'PRO' : 'VIP';
    const body = document.getElementById('tierModalBody');
    body.innerHTML = `
      <span class="tier-modal-badge ${tier}">${label} • Tier ${TIER_LEVELS[tier]} dari 3</span>
      <h3>${data.title}</h3>
      <p class="tier-modal-desc">${data.desc}</p>
      <div class="tier-modal-includes-title">Yang Anda dapatkan:</div>
      <ul class="tier-modal-includes">
        ${data.includes.map(i => `<li>${i}</li>`).join('')}
      </ul>
    `;
    document.getElementById('tierModal').classList.add('open');
  }

  window.openAllTiersModal = function() {
    const body = document.getElementById('tierModalBody');
    body.innerHTML = `
      <h3>Perbedaan Tier Personal, PRO &amp; VIP</h3>
      <p class="tier-modal-desc">Pilih tier sesuai kebutuhan Anda. Semakin tinggi tier, semakin banyak produk AI yang aktif. Item yang berada di tier lebih tinggi dari pilihan Anda akan terkunci (tercoret).</p>
      <div class="tier-modal-all">
        ${['personal','pro','vip'].map(t => {
          const d = TIER_DETAILS[t];
          const label = t === 'personal' ? 'Personal' : t === 'pro' ? 'PRO' : 'VIP';
          return `<div class="tier-modal-all-block" onclick="openTierModal('${t}')">
            <span class="tier-modal-badge ${t}">${label} • Tier ${TIER_LEVELS[t]}</span>
            <h4>${label}</h4>
            <p>${d.desc}</p>
          </div>`;
        }).join('')}
      </div>
    `;
    document.getElementById('tierModal').classList.add('open');
  }

  window.closeTierModal = function() { document.getElementById('tierModal').classList.remove('open'); }
  window.closeTierModalOnOverlay = function(event) {
    if (event.target === document.getElementById('tierModal')) closeTierModal();
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTierModal(); });

  function processCheckout() {
    const emailInput = document.getElementById('emailPembeli');
    const email = emailInput.value.trim();
    const validEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !validEmailPattern.test(email)) {
      emailInput.classList.add('input-error');
      emailInput.focus();
      setTimeout(() => emailInput.classList.remove('input-error'), 1500);
      return;
    }
    const btn = document.getElementById('btnCheckout');
    btn.disabled = true;
    btn.innerHTML = '<svg class="animate-spin" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Memproses...';
    setTimeout(() => {
      const lic = getLicensePriceForTier(currentYears);
      let totalDomainPrice = isDomainAdded ? (domainPricePerYear * domainYears) : 0;
      let subtotal = lic.final + totalDomainPrice;
      let ppn = Math.round(subtotal * 0.11);
      let finalTotal = subtotal + ppn;
      let finalName = selectedPackage.name + ' (' + TIER_NAMES[currentYears] + ' — ' + TIER_TYPE[currentYears] + ')';
      if (isDomainAdded) finalName += ` + Domain ${currentDomainName} (${domainYears} Tahun)`;
      const activeProducts = document.querySelectorAll('.bonus-item:not(.locked)').length;
      let checkoutData = {
        name: finalName, price: finalTotal, isCustom: selectedPackage.isCustom,
        tierLevel: currentYears, tierName: TIER_NAMES[currentYears],
        tierType: TIER_TYPE[currentYears],
        finalLicensePrice: lic.final, activeProductCount: activeProducts,
        isLifetime: currentYears > 1
      };
      localStorage.setItem('wgs_selected_package', JSON.stringify(checkoutData));
      localStorage.setItem('wgs_user_email', email);
      window.location.href = '/checkout';
    }, 1000);
  }

  // === Init ===
  updatePackageUI();
  applyTierLocks();
  calculateTotal();
