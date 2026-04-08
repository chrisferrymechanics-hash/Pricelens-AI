// StoreManager.swift
import StoreKit

@MainActor
class StoreManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []

    // isPro: only relevant for subscriptions / non-consumables
    // Consumables are NOT tracked here — grant them immediately in purchase()
    var isPro: Bool {
        purchasedProductIDs.contains(.proMonthly) ||
        purchasedProductIDs.contains(.proAnnual)  ||
        purchasedProductIDs.contains(.removeAds)   // non-consumable example
    }
    
    func loadProducts() async {
        do {
            // List ALL product IDs — subscriptions, consumables, and non-consumables
            products = try await Product.products(for: [
                .proMonthly,PcLnsPremSub
                .proAnnual,
                .coins100,PrLnsCrPck     // consumable
                .coins500,     // consumable
                .removeAds,    // non-consumable
            ])
        } catch {
            print("Failed to load products: \(error)")
        }
    }
    
    // Called on launch — restores subscriptions and non-consumable purchases
    // Consumables intentionally excluded: they are finish()ed immediately and not re-entitleable
    func updatePurchasedProducts() async {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                purchasedProductIDs.insert(transaction.productID)
            }
        }
    }
}
