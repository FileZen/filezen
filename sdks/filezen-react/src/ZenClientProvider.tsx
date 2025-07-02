'use client';

import { ZenClient, ZenClientOptions } from '@filezen/js';
import React, { createContext, useContext, useMemo } from 'react';

type ZenClientContextType = {
  client: ZenClient;
};

const ZenClientContext = createContext<ZenClientContextType | undefined>(
  undefined,
);

type ZenClientProviderProps = Partial<ZenClientOptions> & {
  children: React.ReactNode;
};

export const ZenClientProvider = ({
  children,
  url,
  signUrl,
}: ZenClientProviderProps) => {
  const client = useMemo(() => new ZenClient({ url, signUrl }), [url, signUrl]);

  return (
    <ZenClientContext.Provider value={{ client }}>
      {children}
    </ZenClientContext.Provider>
  );
};

export const useZenClient = (): ZenClient => {
  const context = useContext(ZenClientContext);
  if (context === undefined) {
    throw new Error('useZenClient must be used within a ZenClientProvider');
  }
  return context.client;
};
