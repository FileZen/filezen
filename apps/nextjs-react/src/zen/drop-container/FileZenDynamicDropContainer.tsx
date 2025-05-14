'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';

export const FileZenDynamicDropContainer = dynamic<
  React.ComponentPropsWithoutRef<'div'>
>(
  () => {
    return import('./FileZenDropContainer').then(
      (res) => res.FileZenDropContainer,
    );
  },
  {
    ssr: false,
    loading: (loadingProps) => {
      return <></>;
    },
  },
);
