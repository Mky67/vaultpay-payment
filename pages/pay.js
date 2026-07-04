import { useRouter } from "next/router";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ConnectButton, useActiveAccount } from "thirdweb/react";

const client = createThirdwebClient({
  clientId: "a27dd7d0078c0ec1f061ebafe47cf8c9",
});

const arcTestnet = defineChain(5042002);

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default function PayPage() {
  const router = useRouter();
  const { to: toRaw, amount } = router.query;
const to = toRaw ? toRaw.toLowerCase() : '';
  const account = useActiveAccount();

  async function handlePay() {
    if (!account) return alert("Please connect your wallet first");
    try {
      const contract = getContract({ client, chain: arcTestnet, address: USDC_ADDRESS });
      const amountInUnits = BigInt(Math.round(parseFloat(amount) * 1e6));
      const toAddress = to.toLowerCase().replace(/^0x/, '0x');
      const transaction = prepareContractCall({
        contract,
        params: [to, amountInUnits],
        params: [to, amountInUnits],
      });
      const result = await sendTransaction({ transaction, account });
      const returnUrl = `${process.env.NEXT_PUBLIC_BUBBLE_RETURN_URL}?tx_hash=${result.transactionHash}`;
      window.location.href = returnUrl;
    } catch (err) {
      alert("Payment failed: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>VaultPay</h1>
      <p>🔒 Private USDC Payment</p>
      <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <p><strong>To:</strong> {to}</p>
        <p><strong>Amount:</strong> {amount} USDC</p>
      </div>
      <ConnectButton client={client} chain={arcTestnet} />
      {account && (
        <button onClick={handlePay} style={{ marginTop: 20, padding: "12px 32px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>
          Confirm & Send
        </button>
      )}
    </div>
  );
}
