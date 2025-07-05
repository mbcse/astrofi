module.exports = {

    COMMON: {
        OWNER_ADDRESS: "0x0000000000000000000000000000000000001010",
        FEE_ADDRESS: "0x0000000000000000000000000000000000001010"
    },

    // Bonding curve parameters - reputation-focused pricing
    BONDING_CURVE: {
        K: 1000,                    // Very low supply impact (was 1M)
        RESERVE_RATIO: 500,         // 50% reserve ratio
        SLIPPAGE_TOLERANCE: 100,    // 1% slippage tolerance
        MAX_REPUTATION_MULTIPLIER: 5000, // 5.0x maximum reputation multiplier
        MIN_REPUTATION_MULTIPLIER: 200,  // 0.2x minimum reputation multiplier
        PLATFORM_FEE: 250           // 2.5% platform fee
    },

    80001: {
        ALL_CHAIN_DEPLOY_SCRIPT_ALLOWED: true,
        CHAIN_NAME: "MUMBAI",
        NETWORK_NAME: "polygon_testnet",
        EIP712_NAME : "",
        EIP712_VERSION : "0",
        CHAIN_NATIVE_CURRENCY_WRAPPED_ADDRESS: "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
        CHAIN_NATIVE_CURRENCY_ADDRESS: "0x0000000000000000000000000000000000001010",
    }
    
}