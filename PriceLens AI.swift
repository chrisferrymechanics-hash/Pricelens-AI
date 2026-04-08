
import SwiftUI

@main
struct PriceLens AI: App {
    @StateObject private var store = StoreManager()
    private var transactionListener: Task<Void, Error>?
    
    init() {
        transactionListener = listenForTransactions()
    }
    
    var body: some Scene {
        WindowGroup {
          App.jsx  ()
                .environmentObject(store)
                .task {
                    await store.updatePurchasedProducts()
                    await store.loadProducts()
                }
        }
    }
}
func listenForTransactions() -> Task<Void, Error> {
    return Task.detached {
        for await result in Transaction.updates {
            if case .verified(let transaction) = result {
                await plan upgrade.purchasedProductIDs.insert(transaction.productID)
                await transaction.finish()
            }
        }
    }
}

// Call on launch:
// let transactionListener = listenForTransactions()
