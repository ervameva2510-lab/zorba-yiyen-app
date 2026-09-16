import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  CheckBox
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PolicyScreen = ({ navigation }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const handleAccept = async () => {
    if (!termsAccepted || !policyAccepted) {
      Alert.alert('Hata', 'Sözleşme ve Politikayı kabul etmelisiniz');
      return;
    }

    try {
      await AsyncStorage.setItem('policyAccepted', 'true');
      navigation.replace('ProfileCreation');
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>📋 SÖZLEŞME & POLİTİKA</Text>
      </View>

      <View style={styles.quranicContainer}>
        <Text style={styles.quranicText}>
          "Ey insanlar! Biz sizi bir erkek ve bir kadından yarattık, ve sizi çeşitli milletlere ve kabilelere ayırdık, ki birbirinizi tanıyasınız. Allah nezdinde en değerli olan sizden en takva sahib olanıdır. Şüphesiz Allah her şeyi bilendir, her şeyden haberdardır."
        </Text>
        <Text style={styles.quranicSource}>- Hucurât Suresi, 13. Ayet</Text>
      </View>

      <View style={styles.policiesContainer}>
        <Text style={styles.sectionTitle}>📌 MADDE 1: Uygulamanın Amacı</Text>
        <Text style={styles.articleText}>
          Bu uygulama, toplum içinde zorbalıkla mücadele etmek ve mağdurları korumak amacıyla kurulmuştur. Uygulamaya katılan tüm üyeler, bu amaca sadık kalacaklarına söz verirler.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 2: Kötü Niyetin Reddi</Text>
        <Text style={styles.articleText}>
          Ben bu uygulamayı kötüye kullanmayacağıma, insanların iyi niyetini kötüye kullanmayacağıma, başkasını taciz, tehdit veya zarar vermek için kullanmayacağıma söz veriyorum.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 3: Kişisel Sorumluluğum</Text>
        <Text style={styles.articleText}>
          Eğer bu uygulamayı kötüye kullanırsam, bu tamamen benim sorumluluğumdur. İnsanların niyetini kötüye kullanırsam, tüm hukuki sonuçlarından ben sorumlu olacağımı kabul ediyorum.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 4: Yasalara Uygunluk</Text>
        <Text style={styles.articleText}>
          Uygulamayı kullanırken Türkiye Cumhuriyeti'nin tüm kanunlarına ve yönetmelikleriyle uyumlu davranacağıma söz veriyorum.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 5: Güvenlik & Gizlilik</Text>
        <Text style={styles.articleText}>
          Profil bilgilerim doğru ve gerçek olacaktır. Başkasının kimliğini kullanmayacağım. Verdiğim kişisel bilgilerinin sorumluluğu benimdir.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 6: Zararlı Davranışlar</Text>
        <Text style={styles.articleText}>
          Şu davranışları yapmayacağıma söz veriyorum: Irkçılık, cinsiyetçilik, din ayrımcılığı, Dolandırıcılık, sahte profil oluşturma, Spam, taciz, tehdit mesajları, Uygulamanın kötüye kullanılması
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 7: Sonuçlar</Text>
        <Text style={styles.articleText}>
          Bu sözleşmeyi ihlal edersem, hesabımın kapatılması, yasal işlem başlatılması ve diğer yasal sonuçlarla karşılaşabilirim.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 8: Yönetici Hakları</Text>
        <Text style={styles.articleText}>
          Uygulama yöneticisi (Admin) istediği zaman: Hesapları kapatma, Mesajları inceleme/silme, Kullanıcıları banlamama, Uygulamadaki içeriği değiştirebilir
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 9: Emniyet Müdürlüğü Bildirim</Text>
        <Text style={styles.articleText}>
          Bu uygulama kullanıcılarının emniyet müdürlükleri ve savcılıklarıyla işbirliği yapmaktadır. Suç unsuru içeren davranışlar yetkili makamlara bildirilir.
        </Text>

        <Text style={styles.sectionTitle}>📌 MADDE 10: Değişiklik Hakkı</Text>
        <Text style={styles.articleText}>
          Uygulama yöneticisi bu sözleşmeyi istediği zaman değiştirebilir ve güncelleme zorunlu kabul edilir.
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <View style={styles.checkboxItem}>
          <CheckBox
            value={termsAccepted}
            onValueChange={setTermsAccepted}
            tintColors={{ true: '#e74c3c', false: '#95a5a6' }}
          />
          <Text style={styles.checkboxLabel}>Tüm Maddeleri Okudum ve Kabul Ediyorum</Text>
        </View>

        <View style={styles.checkboxItem}>
          <CheckBox
            value={policyAccepted}
            onValueChange={setPolicyAccepted}
            tintColors={{ true: '#e74c3c', false: '#95a5a6' }}
          />
          <Text style={styles.checkboxLabel}>Uygulamayı Kötüye Kullanmayacağıma Söz Veriyorum</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.acceptButton,
          (!termsAccepted || !policyAccepted) && styles.acceptButtonDisabled
        ]}
        onPress={handleAccept}
        disabled={!termsAccepted || !policyAccepted}
      >
        <Text style={styles.acceptButtonText}>✅ KABUL EDİYORUM - Devam Et</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ecf0f1',
    padding: 15
  },
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c'
  },
  quranicContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71'
  },
  quranicText: {
    fontSize: 13,
    color: '#2c3e50',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 10
  },
  quranicSource: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'right'
  },
  policiesContainer: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 12
  },
  articleText: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18,
    marginBottom: 10
  },
  checkboxContainer: {
    marginBottom: 20
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1
  },
  acceptButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20
  },
  acceptButtonDisabled: {
    opacity: 0.5
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold'
  }
});

export default PolicyScreen;