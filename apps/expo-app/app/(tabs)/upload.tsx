import { ScrollView, StyleSheet, Text, View } from 'react-native';
import UploadComponent from '../../components/Upload';
import UploadedFilesList from '../../components/UploadedFilesList';

export default function Upload() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🚀 FileZen Mobile Demo</Text>
        <Text style={styles.subtitle}>File Upload with React Native</Text>
      </View>

      <UploadComponent />
      <UploadedFilesList />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Instructions</Text>
        <Text style={styles.instructionText}>
          1. Pick an image or document using the buttons above{'\n'}
          2. Review the file information{'\n'}
          3. Tap &#34;Upload File&#34; to upload to FileZen{'\n'}
          4. Monitor upload progress and view results
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
