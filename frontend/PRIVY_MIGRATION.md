# Privy Migration Guide

The current Wagmi wallet implementation has been commented out and needs to be replaced with Privy for better user experience and authentication.

## Current Status

✅ **Completed:**
- Commented out all Wagmi-related code
- Created placeholder Privy components
- Maintained app functionality during transition

❌ **TODO:**
- Install Privy SDK
- Configure Privy provider
- Replace wallet components
- Update environment variables

## Step 1: Install Privy SDK

```bash
npm install @privy-io/react-auth
```

## Step 2: Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

Get your App ID from [Privy Dashboard](https://dashboard.privy.io/)

## Step 3: Uncomment Privy Provider

In `app/layout.tsx`:

```tsx
// Uncomment these lines:
import { PrivyProviders } from "@/components/providers/privy-provider"

// And in the JSX:
<PrivyProviders>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
    {children}
    {/* ... toaster ... */}
  </ThemeProvider>
</PrivyProviders>
```

## Step 4: Update Privy Provider

In `components/providers/privy-provider.tsx`, uncomment the PrivyProvider configuration:

```tsx
import { PrivyProvider } from '@privy-io/react-auth'

export function PrivyProviders({ children }: PrivyProvidersProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
          logo: 'https://astrofi.app/logo.png',
        },
        loginMethods: ['email', 'wallet', 'google'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}
```

## Step 5: Replace Wallet Components

### Update WalletConnectButton

Replace the current implementation in `components/wallet/wallet-connect-button.tsx` with the Privy version from `components/wallet/privy-wallet-button.tsx`.

### Update WalletGuard

In `components/wallet/wallet-guard.tsx`, replace:

```tsx
import { usePrivy } from '@privy-io/react-auth'

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
    return <div>Loading...</div> // Or your loading component
  }

  if (!authenticated) {
    return fallback || /* your connect wallet UI */
  }

  return <>{children}</>
}
```

### Update WalletInfo

In `components/wallet/wallet-info.tsx`, replace with Privy hooks:

```tsx
import { usePrivy, useWallets } from '@privy-io/react-auth'

export function WalletInfo() {
  const { user, authenticated } = usePrivy()
  const { wallets } = useWallets()

  if (!authenticated || wallets.length === 0) {
    return null
  }

  const wallet = wallets[0]
  // ... rest of implementation
}
```

## Step 6: Update Pages

Update any pages that use wallet functionality:

- `app/mint-chart/page.tsx`
- `app/create-astrologer/page.tsx`
- `app/create-token/page.tsx`
- etc.

Replace Wagmi hooks with Privy hooks as needed.

## Step 7: Test Integration

1. Start the development server
2. Test wallet connection
3. Test authentication flow
4. Verify all features work correctly

## Benefits of Privy

- **Better UX**: Email + social login options
- **Embedded Wallets**: Users don't need external wallets
- **Multi-chain Support**: Easy chain switching
- **Authentication**: Built-in user management
- **Mobile Friendly**: Better mobile experience

## Rollback Plan

If issues arise, you can quickly rollback by:

1. Commenting out Privy imports
2. Uncommenting Wagmi imports
3. Reverting the provider changes

All the original Wagmi code is preserved in comments. 