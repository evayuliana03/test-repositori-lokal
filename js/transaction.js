// =============================================
// AMBIL DATA RESERVASI TERAKHIR
// =============================================
const data = JSON.parse(localStorage.getItem("reservasiTerakhir"));

if (!data) {
    window.location.href = "reservation.html";
}

// =============================================
// METODE PEMBAYARAN (dengan detail instruksi)
// =============================================
const metodeBayar = [
    {
        id    : "qris",
        nama  : "QRIS",
        sub   : "Scan QR — semua e-wallet & m-banking",
        icon  : "bi-qr-code-scan",
        detail: `
        <div class="qris-detail">
            <div class="qris-frame">
                <img src="img/qris.jpeg" alt="QRIS">
            </div>

            <div class="qris-title">MAINPS.ID — PlayStation Lounge</div>

            <div class="qris-sub">
                Scan dengan GoPay · OVO · Dana · ShopeePay
                <br>
                atau m-Banking manapun
            </div>

            <div class="pay-note pay-note-info">
                <i class="bi bi-exclamation-triangle-fill"></i> Nominal sesuai Total Bayar di ringkasan
            </div>
        </div>
    `
    },
    {
        id    : "transfer",
        nama  : "Transfer Bank",
        sub   : "BCA · BRI · Mandiri · BNI",
        icon  : "bi-bank",
        detail: `
            <div>
                <div class="bank-label">PILIH BANK TUJUAN</div>
                ${[
                    { bank:"BCA",rek:"007355522468",   an:"MAINPS ID LOUNGE" },
                    { bank:"BRI",rek:"3209 0100 5910 500",   an:"MAINPS ID LOUNGE" },
                    { bank:"BTN",rek:"8001610044698",   an:"MAINPS ID LOUNGE" },
                    { bank:"Dana",rek:"085893129216",   an:"MAINPS ID LOUNGE" }
                ].map(b => `
                    <div class="bank-row" onclick="pilihdRek(this)">
                        <div class="bank-badge">${b.bank}</div>
                        <div>
                            <div class="bank-rek">${b.rek}</div>
                            <div class="bank-an">a.n. ${b.an}</div>
                        </div>
                        <div class="bank-copy-icon">
                            <i class="bi bi-clipboard-fill"></i>
                        </div>
                    </div>
                `).join("")}
                <div class="pay-note pay-note-warning">
                    <i class="bi bi-exclamation-triangle-fill"></i> Transfer sesuai nominal total. Booking dikonfirmasi setelah pembayaran diterima.
                </div>
            </div>
        `
    },
    {
        id    : "cash",
        nama  : "Cash di Kasir",
        sub   : "Bayar langsung saat tiba di lounge",
        icon  : "bi-cash-stack",
        detail: `
            <div class="qris-detail">
                <div class="cash-icon"><i class="bi bi-cash-stack"></i></div>
                <div class="cash-title">Bayar Cash di Kasir</div>
                <div class="cash-sub">
                    Tunjukkan kode booking ke kasir saat tiba.<br>
                    Bayar sesuai total tagihan.
                </div>
                <div class="pay-note pay-note-success">
                    <i class="bi bi-check-circle-fill"></i> Booking akan dikunci otomatis.<br>
                    Harap tiba 10 menit sebelum jam main.
                </div>
            </div>
        `
    }
];

// Variabel global untuk bayar yang dipilih
let metodeTerpilih = null;

// =============================================
// TAMPILKAN RINGKASAN (summary kanan)
// =============================================
document.getElementById("sum-nama").innerHTML    = data.nama;

// Format tanggal: "2026-06-22" → "22 Juni 2026"
const tgl = new Date(data.tanggal + "T00:00:00");
const namaHari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const namaBulan = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];
document.getElementById("sum-tanggal").innerHTML =
    namaHari[tgl.getDay()] + ", " +
    tgl.getDate() + " " + namaBulan[tgl.getMonth()] + " " + tgl.getFullYear();

document.getElementById("order-room-nama").innerHTML  = data.roomNama || data.tipe;
document.getElementById("order-room-harga").innerHTML =
    "Rp" + data.harga.toLocaleString("id-ID") + "/Jam";

// Jam mulai
const jamMulaiLabel = data.jamMulai.toString().padStart(2,"0") + ":00 WIB";
document.getElementById("sum-jam-mulai").innerHTML = jamMulaiLabel;

// Icon tipe room
let roomIcon = "bi-controller";
if (data.tipe === "VIP")  roomIcon = "bi-star-fill";
if (data.tipe === "VVIP") roomIcon = "bi-gem";
document.getElementById("order-room-emoji").innerHTML = `<i class="bi ${roomIcon}"></i>`;

// =============================================
// RENDER KARTU DURASI
// =============================================
let durasiDipilih = data.durasi;
const durGrid = document.getElementById("dur-grid");

for (let i = 1; i <= 4; i++) {
    const selected = (i === durasiDipilih) ? "selected" : "";
    durGrid.innerHTML += `
        <div class="dur-item ${selected}" data-jam="${i}">
            <div class="dur-jam">${i}</div>
            <div class="dur-price-label">JAM</div>
        </div>
    `;
}

// =============================================
// RENDER SNACK
// =============================================
const snackData = [
    { nama:"Popcorn",    icon:"bi-basket-fill",  harga:5000  },
    { nama:"Kentang",    icon:"bi-basket2-fill", harga:7000  },
    { nama:"Soft Drink", icon:"bi-cup-straw",    harga:3000  },
    { nama:"Cokelat",    icon:"bi-basket3-fill", harga:4000  },
    { nama:"Air Mineral",icon:"bi-droplet-fill", harga:2000  }
];

const snackGrid = document.getElementById("snack-grid");
snackData.forEach(snack => {
    snackGrid.innerHTML += `
        <div class="snack-card" data-harga="${snack.harga}">
            <div class="snack-check-icon"><i class="bi bi-check-lg"></i></div>
            <span class="snack-emoji"><i class="bi ${snack.icon}"></i></span>
            <div class="snack-name">${snack.nama}</div>
            <div class="snack-price">Rp${snack.harga.toLocaleString("id-ID")}</div>
        </div>
    `;
});

// =============================================
// RENDER METODE PEMBAYARAN
// =============================================
const payOpts = document.getElementById("pay-opts");

metodeBayar.forEach(m => {
    payOpts.innerHTML += `
        <div class="pay-option" data-id="${m.id}" onclick="pilihMetode(this)">
            <div class="pay-emoji"><i class="bi ${m.icon}"></i></div>
            <div>
                <div class="pay-name">${m.nama}</div>
                <div class="pay-sub">${m.sub}</div>
            </div>
            <div class="pay-check"><i class="bi bi-check-lg"></i></div>
        </div>
        <!-- Detail instruksi, tersembunyi dulu -->
        <div id="detail-${m.id}" class="pay-detail-panel" style="display:none;">
            ${m.detail}
        </div>
    `;
});

// =============================================
// FUNGSI: Pilih metode bayar → tampilkan detail
// =============================================
function pilihMetode(el) {
    // Reset semua
    document.querySelectorAll(".pay-option").forEach(x => x.classList.remove("selected"));
    document.querySelectorAll("[id^='detail-']").forEach(x => x.style.display = "none");

    // Aktifkan yang diklik
    el.classList.add("selected");
    metodeTerpilih = el.dataset.id;

    // Tampilkan panel detail instruksi
    document.getElementById("detail-" + metodeTerpilih).style.display = "block";

    // Aktifkan tombol konfirmasi
    const btn = document.getElementById("btn-konfirmasi");
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Konfirmasi Pesanan';
}

// =============================================
// FUNGSI: Klik rekening bank → copy ke clipboard
// =============================================
function pilihdRek(el) {
    const norek = el.querySelector(".bank-rek").innerText;
    const iconWrap = el.querySelector(".bank-copy-icon");

    navigator.clipboard.writeText(norek).then(() => {
        iconWrap.innerHTML = '<i class="bi bi-clipboard-check-fill"></i>';
        setTimeout(() => {
            iconWrap.innerHTML = '<i class="bi bi-clipboard-fill"></i>';
        }, 2000);
    }).catch(() => {
        alert("No. Rek: " + norek);
    });
}

// =============================================
// HITUNG TOTAL
// =============================================
function hitungTotal() {
    let totalSnack = 0;
    const snackDipilih = [];

    document.querySelectorAll(".snack-card.selected").forEach(card => {
        const harga = Number(card.dataset.harga);
        totalSnack += harga;
        snackDipilih.push({
            nama : card.querySelector(".snack-name").innerText,
            harga: harga
        });
    });

    const hargaRoom  = data.harga * durasiDipilih;
    const totalAkhir = hargaRoom + totalSnack;

    // Jam selesai
    const selesaiAngka = (data.jamMulai + durasiDipilih) % 24;
    const selesaiLabel = selesaiAngka.toString().padStart(2,"0") + ":00 WIB";

    // Update summary
    document.getElementById("sum-durasi").innerHTML      = durasiDipilih + " Jam";
    document.getElementById("sum-jam-selesai").innerHTML = selesaiLabel;
    document.getElementById("sum-harga-room").innerHTML  = "Rp" + hargaRoom.toLocaleString("id-ID");
    document.getElementById("sum-total").innerHTML       = "Rp" + totalAkhir.toLocaleString("id-ID");

    // Tampilkan baris snack di summary
    const snackArea = document.getElementById("sum-snack-area");
    snackArea.innerHTML = "";
    snackDipilih.forEach(s => {
        snackArea.innerHTML += `
            <div class="order-line">
                <span class="order-line-key">+ ${s.nama}</span>
                <span class="order-line-val">Rp${s.harga.toLocaleString("id-ID")}</span>
            </div>
        `;
    });
}

hitungTotal();

// =============================================
// EVENT: Klik kartu durasi
// =============================================
document.querySelectorAll(".dur-item").forEach(item => {
    item.onclick = function () {
        document.querySelectorAll(".dur-item").forEach(x => x.classList.remove("selected"));
        this.classList.add("selected");
        durasiDipilih = Number(this.dataset.jam);
        hitungTotal();
    };
});

// =============================================
// EVENT: Klik kartu snack
// =============================================
document.querySelectorAll(".snack-card").forEach(card => {
    card.onclick = function () {
        this.classList.toggle("selected");
        hitungTotal();
    };
});

// =============================================
// EVENT: Tombol konfirmasi → modal sukses
// =============================================
document.getElementById("btn-konfirmasi").onclick = function () {
    if (!metodeTerpilih) return;

    // Isi modal
    document.getElementById("modal-nama").innerHTML    = data.nama;
    document.getElementById("modal-room").innerHTML    = data.roomNama || data.tipe;
    document.getElementById("modal-tanggal").innerHTML = document.getElementById("sum-tanggal").innerHTML;
    document.getElementById("modal-total").innerHTML   = document.getElementById("sum-total").innerHTML;
    document.getElementById("modal-booking-code").innerHTML = data.kodebooking;

    // Tambahkan info metode bayar di modal
    const m = metodeBayar.find(x => x.id === metodeTerpilih);
    if (m) {
        const elMetode = document.getElementById("modal-metode");
        if (elMetode) elMetode.innerHTML = `<i class="bi ${m.icon}"></i> ${m.nama}`;
    }

    new bootstrap.Modal(document.getElementById("modal-sukses")).show();
};