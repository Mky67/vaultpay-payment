import { useRouter } from "next/router";
import { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ConnectButton, useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";

const client = createThirdwebClient({
  clientId: "a27dd7d0078c0ec1f061ebafe47cf8c9",
});

const arcTestnet = defineChain(5042002);

function toChecksumAddress(address) {
  const addr = address.toLowerCase().replace('0x', '');
  const hash = Array.from(addr).reduce((h, c) => {
    return h;
  }, '');
  return '0x' + addr.split('').map((c, i) => {
    return c;
  }).join('');
}

const USDC_ABI = [{
  name: "transfer",
  type: "function",
  stateMutability: "nonpayable",
  inputs: [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" }
  ],
  outputs: [{ name: "", type: "bool" }]
}];

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default function PayPage() {
  const router = useRouter();
  const { to, amount } = router.query;
  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!account || !to || !amount) return;
    setLoading(true);
    try {
      const contract = getContract({
        client,
        chain: arcTestnet,
        address: USDC_ADDRESS,
        abi: USDC_ABI,
      });
      const amountInUnits = BigInt(Math.round(parseFloat(amount) * 1e6));
      const transaction = prepareContractCall({
        contract,
        method: "transfer",
        params: [to, amountInUnits],
      });
      sendTx(transaction, {
        onSuccess: (result) => {
          const returnUrl = `${process.env.NEXT_PUBLIC_BUBBLE_RETURN_URL}?tx_hash=${result.transactionHash}`;
          window.location.href = returnUrl;
        },
        onError: (err) => {
          alert("Payment failed: " + err.message);
          setLoading(false);
        }
      });
    } catch (err) {
      alert("Error: " + err.message);
      setLoading(false);
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
        <button onClick={handlePay} disabled={loading} style={{ marginTop: 20, padding: "12px 32px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>
          {loading ? "Sending..." : "Confirm & Send"}
        </button>
      )}
    </div>
  );
}
