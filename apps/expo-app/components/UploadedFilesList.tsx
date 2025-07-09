import type { ZenFile, ZenUpload } from '@filezen/js';
import { useFileZen } from '@filezen/react';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function UploadedFilesList() {
  const { uploads } = useFileZen();
  const [show, setShow] = React.useState(true);

  if (!show || uploads.length === 0) return null;

  const isImageFile = (file?: ZenFile | null) => {
    if (!file?.mimeType) return false;
    return file.mimeType.startsWith('image/');
  };

  const getUploadStatus = (upload: ZenUpload) => {
    if (upload.error) return 'error';
    if (upload.isCompleted && upload.file?.url) return 'success';
    if (!upload.isCompleted) return 'uploading';
    return 'pending';
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📁 Upload Results</Text>
        <TouchableOpacity onPress={() => setShow(false)}>
          <Text style={styles.clearButtonText}>Hide</Text>
        </TouchableOpacity>
      </View>
      {uploads.map((upload, index) => {
        const status = getUploadStatus(upload);
        const isImage = status === 'success' && isImageFile(upload.file);

        return (
          <View
            key={index}
            style={[
              styles.uploadedFile,
              status === 'error'
                ? styles.uploadedFileError
                : status === 'uploading'
                  ? styles.uploadedFileUploading
                  : styles.uploadedFileSuccess,
            ]}
          >
            <View style={styles.uploadContent}>
              <View style={styles.uploadInfo}>
                <View style={styles.uploadHeader}>
                  <View style={styles.uploadStatusContainer}>
                    {status === 'uploading' ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                      <Text style={styles.uploadStatus}>
                        {status === 'error'
                          ? '❌'
                          : status === 'success'
                            ? '✅'
                            : '⏳'}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.uploadedFileName,
                      status === 'error' && styles.uploadedFileNameError,
                    ]}
                  >
                    {upload.file?.name || `File ${index + 1}`}
                  </Text>
                </View>

                {status === 'error' ? (
                  <Text style={styles.uploadError}>
                    Error: {upload.error?.message || 'Upload failed'}
                  </Text>
                ) : status === 'success' ? (
                  <Text style={styles.uploadedFileUrl}>{upload.file?.url}</Text>
                ) : status === 'uploading' ? (
                  <Text style={styles.uploadingText}>Uploading...</Text>
                ) : null}
              </View>

              {isImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{
                      uri: `${upload.file?.url}?width=120&height=120&fit=cover`,
                    }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedFile: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  uploadedFileSuccess: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  uploadedFileError: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  uploadedFileUploading: {
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  uploadInfo: {
    flex: 1,
    marginRight: 10,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  uploadStatusContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  uploadStatus: {
    fontSize: 16,
  },
  uploadedFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  uploadedFileNameError: {
    color: '#e53e3e',
  },
  uploadedFileUrl: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  uploadError: {
    fontSize: 12,
    color: '#e53e3e',
    fontStyle: 'italic',
  },
  uploadingText: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  imagePreviewContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
});
