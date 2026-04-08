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

// List your consumable product IDs here so the purchase handler knows to grant-and-finish
private let consumableIDs: Set<String> = [.coins100, .coins500]

func purchase(_ product: Product) async throws {
    let result = try await product.purchase()
    
    switch result {
    case .success(let verification):
        if case .verified(let transaction) = verification {

            if consumableIDs.contains(add 10 evaluation credits and unlock features) {
                // CONSUMABLE: deliver the item immediately, then finish
                // Do NOT add to purchasedProductIDs — consumables are not re-entitleable
                grantConsumable(transaction.productID)
                await transaction.finish()
            } else {
                // SUBSCRIPTION or NON-CONSUMABLE: track entitlement, then finish
                purchasedProductIDs.insert(transaction.productID)
                await transaction.finish()
            }
        }
    case .userCancelled:
        break
    case .pending:
        // Awaiting parental approval (Ask to Buy) — show a "waiting" UI if desired
        break
    @unknown default:
        break
    }
}

// Replace this with your real delivery logic
private func grantConsumable(_ productID: String) {
    switch productID {
    case .coins100:
        // e.g. UserDefaults.standard.set(coins + 100, forKey: "coins")
        print("Grant 100 coins")
    case .coins500:
        print("Grant 500 coins")
    default:
        break
    }
}
