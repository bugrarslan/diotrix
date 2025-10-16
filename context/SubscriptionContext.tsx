import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

type SubscriptionContextValue = {
  loading: boolean;
  processing: boolean;
  error: Error | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  availablePackages: PurchasesPackage[];
  activeEntitlements: string[];
  isPro: boolean;
  refresh: () => Promise<void>;
  purchasePackage: (selectedPackage: PurchasesPackage) => Promise<CustomerInfo>;
  purchasePackageByIdentifier: (identifier: string) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
  manageSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

const normalizeError = (error: unknown, fallbackMessage: string): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
};

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add delay to ensure RevenueCat is configured
      if (!initialized) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const [info, fetchedOfferings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      setCustomerInfo(info);
      setOfferings(fetchedOfferings);
      setInitialized(true);
    } catch (err) {
      const normalized = normalizeError(
        err,
        "Unable to refresh subscription details."
      );
      setError(normalized);
      console.error("Subscription refresh error:", normalized);

      // Don't throw on initial load to prevent app crash
      if (initialized) {
        throw normalized;
      }
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    // Delay initial fetch to ensure RevenueCat is configured
    const timer = setTimeout(() => {
      void refresh();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const purchasePackage = useCallback(
    async (selectedPackage: PurchasesPackage) => {
      setProcessing(true);
      setError(null);

      try {
        const { customerInfo: updatedCustomerInfo } =
          await Purchases.purchasePackage(selectedPackage);
        setCustomerInfo(updatedCustomerInfo);
        return updatedCustomerInfo;
      } catch (err: any) {
        // Handle specific RevenueCat errors
        const errorCode = err?.code || err?.userInfo?.readable_error_code;
        let errorMessage = "Purchase did not complete.";

        if (errorCode === "1" || err?.message?.includes("cancelled")) {
          errorMessage = "Purchase was cancelled.";
        } else if (errorCode === "2" || err?.message?.includes("network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err?.message?.includes("temporarily unavailable")) {
          errorMessage =
            "Store is temporarily unavailable. Please try again later.";
        } else if (err?.message) {
          errorMessage = err.message;
        }

        const normalized = normalizeError(err, errorMessage);
        setError(normalized);
        console.error("Purchase error:", {
          errorCode,
          message: err?.message,
          err,
        });
        throw normalized;
      } finally {
        setProcessing(false);
        void refresh();
      }
    },
    [refresh]
  );

  const purchasePackageByIdentifier = useCallback(
    async (identifier: string) => {
      const availablePackages = offerings?.current?.availablePackages ?? [];
      const targetPackage = availablePackages.find(
        (pkg) => pkg.identifier === identifier
      );

      if (!targetPackage) {
        throw new Error(
          "The selected package is unavailable. Please try again later."
        );
      }

      return purchasePackage(targetPackage);
    },
    [offerings, purchasePackage]
  );

  const restorePurchases = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);
      return restoredInfo;
    } catch (err: any) {
      const errorMessage = err?.message?.includes("network")
        ? "Network error. Please check your connection and try again."
        : err?.message?.includes("temporarily unavailable")
          ? "Store is temporarily unavailable. Please try again later."
          : "Unable to restore purchases.";

      const normalized = normalizeError(err, errorMessage);
      setError(normalized);
      console.error("Restore purchases error:", err);
      throw normalized;
    } finally {
      setProcessing(false);
      void refresh();
    }
  }, [refresh]);

  const manageSubscription = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      await Purchases.showManageSubscriptions();
    } catch (err) {
      const normalized = normalizeError(
        err,
        "Unable to open subscription management."
      );
      setError(normalized);
      throw normalized;
    } finally {
      setProcessing(false);
    }
  }, []);

  const activeEntitlements = useMemo(
    () => Object.keys(customerInfo?.entitlements?.active ?? {}),
    [customerInfo]
  );

  const availablePackages = useMemo(
    () => offerings?.current?.availablePackages ?? [],
    [offerings]
  );

  const isPro = useMemo(() => {
    if (activeEntitlements.includes("Diotrix Pro")) {
      return true;
    }

    const hasAnyEntitlement = activeEntitlements.length > 0;
    const hasActiveSubscription =
      (customerInfo?.activeSubscriptions ?? []).length > 0;

    return hasAnyEntitlement || hasActiveSubscription;
  }, [activeEntitlements, customerInfo]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      loading,
      processing,
      error,
      customerInfo,
      offerings,
      availablePackages,
      activeEntitlements,
      isPro,
      refresh,
      purchasePackage,
      purchasePackageByIdentifier,
      restorePurchases,
      manageSubscription,
    }),
    [
      loading,
      processing,
      error,
      customerInfo,
      offerings,
      availablePackages,
      activeEntitlements,
      isPro,
      refresh,
      purchasePackage,
      purchasePackageByIdentifier,
      restorePurchases,
      manageSubscription,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptionContext = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }

  return context;
};
