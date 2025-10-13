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

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

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

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const [info, fetchedOfferings] = await Promise.all([
				Purchases.getCustomerInfo(),
				Purchases.getOfferings(),
			]);

			setCustomerInfo(info);
			setOfferings(fetchedOfferings);
		} catch (err) {
			const normalized = normalizeError(err, "Unable to refresh subscription details.");
			setError(normalized);
			throw normalized;
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const purchasePackage = useCallback(
		async (selectedPackage: PurchasesPackage) => {
			setProcessing(true);
			setError(null);

			try {
				const { customerInfo: updatedCustomerInfo } = await Purchases.purchasePackage(selectedPackage);
				setCustomerInfo(updatedCustomerInfo);
				return updatedCustomerInfo;
			} catch (err) {
				const normalized = normalizeError(err, "Purchase did not complete.");
				setError(normalized);
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
			const targetPackage = availablePackages.find((pkg) => pkg.identifier === identifier);

			if (!targetPackage) {
				throw new Error("The selected package is unavailable. Please try again later.");
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
		} catch (err) {
			const normalized = normalizeError(err, "Unable to restore purchases.");
			setError(normalized);
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
			const normalized = normalizeError(err, "Unable to open subscription management.");
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
		const hasActiveSubscription = (customerInfo?.activeSubscriptions ?? []).length > 0;

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

	return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscriptionContext = (): SubscriptionContextValue => {
	const context = useContext(SubscriptionContext);

	if (!context) {
		throw new Error("useSubscriptionContext must be used within a SubscriptionProvider");
	}

	return context;
};
