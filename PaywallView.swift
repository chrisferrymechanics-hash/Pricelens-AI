// PaywallView.swift
import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject var store: StoreManager
    @State private var isPurchasing = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Upgrade to Premium")
                .font(.largeTitle.bold())
            
            ForEach(store.products) { product in
                Button {
                    Task {
                        isPurchasing = true
                        try? await store.purchase(product)
                        isPurchasing = false
                    }
                } label: {
                    HStack {
                        Text(product.displayName)
                        Spacer()
                        Text(product.displayPrice)
                            .bold()
                    }
                    .padding()
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(isPurchasing)
            }
            
            Button("Restore Purchases") {
                Task { await AppStore.sync() }
            }
            .font(.footnote)
            .foregroundColor(.secondary)
        }
        .padding()
        .task {
            await store.loadProducts()
        }
    }
}
