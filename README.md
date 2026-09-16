# 🚀 ZORBA YIYEN APP - Tam Rehber

## 📱 Uygulama Nedir?

Zorbalığa karşı toplumsal bir harekettir. Kullanıcılar:
- **Zorbalığa uğradıkları durumda** hemen yardım çağırabilir
- **Kavgaya çağrı konusunda haklıysanız** karşı tarafla yüz yüze görüşebilir
- **Gruplar oluşturarak** bölgesel dayanışma sağlayabilir
- **Mesajlaşarak** gerçek hayatta buluşabilir
- **SOS sistemi** ile acil durumlarda yardım alabilir

---

## 🏗️ Teknoloji Stack

### Frontend (React Native)
- React Native + Expo
- React Navigation (Tab + Stack Navigator)
- Socket.io-client (Gerçek zamanlı mesajlaşma)
- AsyncStorage (Local veri saklama)
- Axios (API İsteği)

### Backend (Node.js)
- Express.js (API Server)
- MongoDB (Veritabanı)
- Socket.io (Gerçek zamanlı iletişim)
- Bcrypt (Şifre Hashleme)
- JWT (Token Authentication)

---

## 📁 Klasör Yapısı

```
zorba-yiyen-app/
├── frontend/                    # React Native App
│   ├── App.js                  # Main Navigation
│   ├── screens/                # Tüm Ekranlar
│   │   ├── LoginScreen.js
│   │   ├── PolicyScreen.js
│   │   ├── ProfileCreationScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── BullyingScreen.js
│   │   ├── FightScreen.js
│   │   ├── SOSScreen.js
│   │   ├── GroupsScreen.js
│   │   ├── MessagesScreen.js
│   │   └── AdminPanelScreen.js
│   ├── package.json
│   └── app.json                # Expo config
├── models/                      # Database Schemas
│   ├── User.js
│   ├── Message.js
│   ├── Group.js
│   ├── Policy.js
│   └── SOSAlert.js
├── routes/                      # API Routes
│   ├── auth.js                 # Giriş/Çıkış
│   ├── users.js                # Profil
│   ├── messages.js             # Mesajlaşma
│   ├── groups.js               # Gruplar
│   ├── sos.js                  # SOS Sistemi
│   └── admin.js                # Admin Paneli
├── server.js                    # Main Server
├── .env                        # Environment Variables
├── package.json
└── README.md
```

---

## 🚀 Kurulum & Çalıştırma

### Backend Kurulumu

```bash
# 1. Backend klasörüne gidin
cd zorba-yiyen-app

# 2. Bağımlılıkları yükleyin
npm install

# 3. .env dosyası oluşturun
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/zorba-yiyen
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
EOF

# 4. MongoDB başlatın (Windows)
mongod

# 5. Development modunda çalıştırın
npm run dev
```

### Frontend Kurulumu

```bash
# 1. Frontend klasörüne gidin
cd frontend

# 2. Bağımlılıkları yükleyin
npm install

# 3. App.js'de Backend URL'sini güncelleyin
# const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';

# 4. Expo'yu başlatın
npm start

# 5. Android/iOS Seçin
# a) Android: "a" tuşuna basın
# b) iOS: "i" tuşuna basın
# c) Web: "w" tuşuna basın
```

---

## 🔐 Güvenlik Notları

### ✅ Yapılanlar
- ✅ Bcrypt ile Şifre Hashleme (10 rounds)
- ✅ JWT Token Authentication
- ✅ Environment Variables (.env dosyası)
- ✅ CORS (Cross-Origin Resource Sharing)
- ✅ Şifre asla localStorage'da saklanmıyor
- ✅ Socket.io ile Gerçek Zamanlı İletişim

### ⚠️ Üretim Öncesi Yapılması Gerekenler
- [ ] HTTPS Sertifikası Alın (Let's Encrypt)
- [ ] JWT_SECRET'i Güçlü Bir Anahtarla Değiştirin
- [ ] MongoDB'yi Cloud'a Taşıyın (MongoDB Atlas)
- [ ] Backend URL'sini Production'a Güncelleyin
- [ ] Rate Limiting Ekleyin (Express-rate-limit)
- [ ] Input Validation Ekleyin (Express-validator)
- [ ] Error Logging Ekleyin (Winston, Morgan)
- [ ] Database Backup Ayarlanması

---

## 📊 API Endpoints

### Auth Routes (`/api/auth`)
```
POST   /login           - Giriş Yap
POST   /register        - Kullanıcı Oluştur
POST   /verify          - Token Doğrula
```

### User Routes (`/api/users`)
```
GET    /:userId         - Profil Bilgisi
PUT    /:userId/profile - Profil Güncelle
POST   /filter          - Filtreli Arama
```

### Message Routes (`/api/messages`)
```
POST   /send            - Mesaj Gönder
GET    /between/:u1/:u2 - İki Kullanıcı Arasındaki Mesajlar
GET    /inbox/:userId   - Gelen Kutusu
PUT    /read/:messageId - Mesajı Okundu İşaretle
```

### Group Routes (`/api/groups`)
```
POST   /create          - Grup Oluştur
GET    /location/:city  - Konuma Göre Gruplar
GET    /:groupId        - Grup Detayları
POST   /:groupId/join   - Gruba Kat
POST   /:groupId/leave  - Gruptan Ayrıl
```

### SOS Routes (`/api/sos`)
```
POST   /create          - SOS Çağrısı Yap
GET    /active          - Aktif SOS Çağrıları
POST   /:sosId/respond  - SOS'a Yanıt Ver
```

### Admin Routes (`/api/admin`)
```
GET    /users           - Tüm Kullanıcıları Listele
PUT    /users/:id/ban   - Kullanıcıyı Yasakla
PUT    /users/:id/unban - Yasaklamayı Kaldır
DELETE /users/:id       - Kullanıcıyı Sil
GET    /statistics      - İstatistikler
```

---

## 🎯 Özellikler Detayı

### 1️⃣ Giriş Sistemi
- Kullanıcı Adı + Şifre ile Giriş
- JWT Token Based Authentication
- Şifre Bcrypt ile Hashleniyor

### 2️⃣ Profil Oluşturma
- Zorunlu Alanlar:
  - Profil Fotoğrafı
  - Konum (Şehir/İlçe)
  - Spor Durumu (Sporcu/Acemi/Başlamamış)
  - Fitness Durumu (Fit/Yarı Fit/Hafif Göbekli/Göbekli/Obez)
  - Etiket (Haklıysan Kavgaya Gelirim / Zorbalığa Gelirim)

### 3️⃣ Zorbalığa Uğradım
- Filtreli Kullanıcı Arama
- "Zorbalığa Gelirim" Etiketine Sahip Kişilerle İletişim
- Mesaj Gönderme

### 4️⃣ Kavgaya Adam Çağır
- "Haklıysan Kavgaya Gelirim" Etiketine Sahip Kişilerle Bağlanma
- Davet Sistemi

### 5️⃣ SOS Sistemi
- Acil Durumda Çağrı Yapma
- Bölgedeki Tüm Kişilere Bildirim
- Emniyet Müdürlüğüne Otomatik Rapor
- Yanıt Veren Kişi Listesi

### 6️⃣ Gruplar
- Bölgesel Gruplar Oluşturma
- Gruplara Katılma/Ayrılma
- Grup Üyesi Yönetimi

### 7️⃣ Mesajlaşma
- Socket.io ile Gerçek Zamanlı Mesajlaşma
- Sohbet Geçmişi
- Mesaj Okundu Göstergesi

### 8️⃣ Admin Paneli
- İstatistik Görüntüleme
- Kullanıcı Yönetimi
- Yasaklama/Yasağı Kaldırma
- Kullanıcı Silme

---

## 🐛 Sık Karşılaşılan Hatalar

### Error: CORS Hatası
```javascript
// ✅ Çözüm: Backend'de CORS Etkinleştirin
app.use(cors({ origin: '*' }));
```

### Error: MongoDB Bağlantısı Başarısız
```bash
# ✅ Çözüm: MongoDB'yi Başlatın
mongod
```

### Error: Socket.io Bağlantısı Başarısız
```javascript
// ✅ Çözüm: Backend URL'sini Güncelleyin
const SOCKET_URL = 'http://YOUR_COMPUTER_IP:5000';
```

---

## 📞 İletişim & Destek

- 📧 Email: info@zorba-yiyen.com
- 📱 Instagram: @zorba-yiyen
- 🌐 Website: www.zorba-yiyen.com

---

## ⚖️ Yasal Uyarı

⚠️ **Bu uygulama suç amaçlı kullanılamaz!**
- Suç unsuru taşıyan davranışlar Emniyet Müdürlüğü ve Savcılığa bildirilir
- Uygulamayı kötüye kullananlar Ceza ve İcra Mükellefiyeti altına alınır
- Tüm kullanıcı verileri şifreli ve güvenli tutulur

---

## 📄 Lisans

MIT Lisansı - Açık Kaynak Proje

---

**Son Güncelleme**: 16 Eylül 2026
**Versiyon**: 1.0.0
