'use client';

import { useState, useCallback } from 'react';

type ModalType = 'success' | 'error' | 'info';

interface UseModalReturn {
  isOpen: boolean;
  modalProps: {
    title: string;
    message: string;
    type: ModalType;
    confirmText: string;
    cancelText?: string;
  };
  showModal: (options: {
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }) => void;
  hideModal: () => void;
  onConfirm: (() => void) | undefined;
}

export default function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: '',
    message: '',
    type: 'info' as ModalType,
    confirmText: 'OK',
    cancelText: undefined as string | undefined,
  });
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>(undefined);

  const showModal = useCallback(({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText,
    onConfirm
  }: {
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
  }) => {
    setModalProps({
      title,
      message,
      type,
      confirmText,
      cancelText
    });
    setOnConfirm(() => onConfirm);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    modalProps,
    showModal,
    hideModal,
    onConfirm
  };
}
