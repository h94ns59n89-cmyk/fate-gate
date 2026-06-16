import { create } from 'zustand';

interface UIState {
  isPaymentModalOpen: boolean;
  paymentReportId: number | null;
  openPaymentModal: (reportId: number) => void;
  closePaymentModal: () => void;
  isShareModalOpen: boolean;
  openShareModal: () => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isPaymentModalOpen: false,
  paymentReportId: null,
  openPaymentModal: (reportId) => set({ isPaymentModalOpen: true, paymentReportId: reportId }),
  closePaymentModal: () => set({ isPaymentModalOpen: false, paymentReportId: null }),
  isShareModalOpen: false,
  openShareModal: () => set({ isShareModalOpen: true }),
  closeShareModal: () => set({ isShareModalOpen: false }),
}));
