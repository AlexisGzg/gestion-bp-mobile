import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CustomAlertModal, CustomAlertOptions } from '../components/organisms/CustomAlertModal';

interface AlertContextValue {
  showAlert: (options: CustomAlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertOptions, setAlertOptions] = useState<CustomAlertOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((options: CustomAlertOptions) => {
    setAlertOptions(options);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlertModal
        visible={visible}
        options={alertOptions}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export function useAlert(): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe utilizarse dentro de un AlertProvider');
  }
  return context;
}
