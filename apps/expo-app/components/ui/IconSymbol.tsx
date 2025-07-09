import React from 'react';
import { Text } from 'react-native';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  // Simple emoji-based icons for common cases
  const iconMap: Record<string, string> = {
    'house.fill': '🏠',
    'paperplane.fill': '📤',
    'upload': '📤',
  };

  const icon = iconMap[name] || '📄';

  return (
    <Text style={{ fontSize: size, color }}>
      {icon}
    </Text>
  );
} 