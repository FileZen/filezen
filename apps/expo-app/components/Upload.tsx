import { useFileZen } from '@filezen/react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Upload() {
  const { upload } = useFileZen();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Upload the file using the FileZen provider
    const uploadResult = await upload(selectedFile.uri, {
      folder: 'mobile-uploads',
      projectId: 'mobile-demo',
      name: selectedFile.name,
      // Add progress listener
      listener: {
        onProgress: (upload, progress) => {
          setUploadProgress(progress.percent || 0);
        },
        onComplete: (upload) => {
          setUploading(false);
          setUploadProgress(100);
          Alert.alert('Success', 'File uploaded successfully!');
        },
        onError: (upload, error) => {
          setUploading(false);
          setUploadProgress(0);
          Alert.alert('Error', `Upload failed: ${error.message}`);
        },
      },
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 File Selection</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => pickDocument()}
          >
            <Text style={styles.buttonText}>📄 Pick Document</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoTitle}>Selected File:</Text>
            <Text style={styles.fileInfoText}>Name: {selectedFile.name}</Text>
            <Text style={styles.fileInfoText}>Type: {selectedFile.type}</Text>
            <Text style={styles.fileInfoText}>
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </Text>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelection}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 Upload</Text>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!selectedFile || uploading) && styles.disabledButton,
          ]}
          onPress={uploadFile}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadButtonText}>
                Uploading... {uploadProgress.toFixed(0)}%
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Upload File</Text>
          )}
        </TouchableOpacity>

        {uploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  fileInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fileInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clearButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  activeUpload: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  activeUploadText: {
    fontSize: 14,
    color: '#333',
  },
});
