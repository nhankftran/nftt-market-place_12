"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button" // Đảm bảo Button được import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Dọn dẹp import: chỉ giữ lại các icon thực sự được dùng trong component này
import { Wallet, Sparkles, Shield, Users, Trophy, UsersRound, Moon, Heart, Zap, Flame } from "lucide-react"
// Các icon thực sự được dùng dựa trên code JSX bạn cung cấp:
// Flame (cho remaining NFTs)
// Zap, Shield, Wallet (cho 3 card đầu Holder Benefits)
// Heart, UsersRound, Moon (cho 3 card cuối Holder Benefits)
// -> Vậy các icon cần thiết là: Flame, Zap, Shield, Wallet, Heart, UsersRound, Moon
// -> Sparkles, Users, Trophy có thể không cần nếu không dùng ở đâu khác trong file này.
// -> Để đơn giản, tôi sẽ giữ nguyên dòng import của bạn, bạn có thể tự dọn dẹp sau nếu muốn.

import Navbar from "@/components/navbar"
import { sepolia } from "thirdweb/chains"
import { getContract } from "thirdweb"
import { client } from "@/app/client"
import { getContractMetadata } from "thirdweb/extensions/common"
import { useReadContract, useActiveAccount } from "thirdweb/react"
import { MediaRenderer } from "thirdweb/react"
import { claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc721"
import { TransactionButton } from "thirdweb/react"
import { formatEther } from "viem"

export default function Home() {
  const account = useActiveAccount();

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
  })

  const { data: contractMetadata, isLoading: isLoadingContractMetadata } = useReadContract(getContractMetadata, {
    contract: contract,
  });

  const { data: totalMintedData, isLoading: isLoadingTotalMinted } = useReadContract({
    contract: contract,
    method: "function totalMinted() view returns (uint256)",
    params: [],
  });

  const { data: maxSupplyData, isLoading: isLoadingMaxSupply } = useReadContract({
    contract: contract,
    method: "function maxTotalSupply() view returns (uint256)",
    params: [],
  });

  const { data: activeClaimCondition, isLoading: isLoadingClaimCondition } = useReadContract(
    getActiveClaimCondition,
    {
      contract: contract
    }
  );

  const totalMintedCount = totalMintedData ? BigInt(totalMintedData.toString()) : BigInt(0);
  const maxSupplyCount = maxSupplyData ? BigInt(maxSupplyData.toString()) : BigInt(0);

  const isLoadingSupply = isLoadingTotalMinted || isLoadingMaxSupply;
  const dataAvailable = !isLoadingSupply && maxSupplyData && totalMintedData;
  let remainingNFTs = BigInt(0);
  let isSoldOut = false;
  let canShowLimitedSupply = false;

  if (dataAvailable) {
    if (maxSupplyCount > 0) {
      remainingNFTs = maxSupplyCount - totalMintedCount;
      if (remainingNFTs <= 0) {
        isSoldOut = true;
        remainingNFTs = BigInt(0);
      } else {
        canShowLimitedSupply = true;
      }
    }
  }

  const collectionUrl = contract.address
    ? `https://sepolia.etherscan.io/token/${contract.address}`
    : "#";

  let mintPriceDisplay = "N/A";
  if (isLoadingClaimCondition) {
    mintPriceDisplay = "Loading price...";
  } else if (activeClaimCondition) {
    const priceInEther = formatEther(activeClaimCondition.pricePerToken);
    mintPriceDisplay = `${priceInEther} ETH`;
  } else {
    mintPriceDisplay = "Not for sale";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="relative w-full max-w-[450px] aspect-square rounded-xl overflow-hidden border shadow-lg">
                <MediaRenderer
                  client={client}
                  src={contractMetadata?.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  className="object-cover w-full h-full"
                  style={{
                    borderRadius: "1rem",
                  }}
                />
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full">
                  <Badge variant="secondary" className="font-semibold">
                    #No1
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                {isLoadingContractMetadata ? (
                  <>
                    <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{contractMetadata?.name || "NFT Collection"}</h1>
                    {contractMetadata?.description ? (
                      <p className="text-xl text-muted-foreground mb-6">
                        {contractMetadata.description}
                      </p>
                    ) : (
                      <p className="text-xl mb-6">
                        <span className="animated-gradient-text font-semibold">
                          Own Your NFT Now!!!!!!!!.
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {isLoadingSupply && (
                <p className="text-lg font-semibold text-muted-foreground mb-4 animate-pulse">
                  Loading supply...
                </p>
              )}
              {!isLoadingSupply && canShowLimitedSupply && (
                <p className="text-2xl font-bold mb-4 flex items-center justify-center sm:justify-start">
                  <Flame className="mr-2 h-7 w-7 text-orange-500" /> {/* Biểu tượng lửa vẫn hợp lý */}
                  <span className="animated-vibrant-gradient-text"> {/* Sử dụng class gradient mới */}
                    🔥 Only {remainingNFTs.toString()} NFTs left! Secure yours NOW before it's too late!
                  </span>
                </p>
              )}
              {!isLoadingSupply && isSoldOut && maxSupplyCount > 0 && (
                <p className="text-2xl font-bold text-red-600 mb-4 flex items-center justify-center sm:justify-start">
                  SOLD OUT!
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <TransactionButton
                  transaction={() => {
                    if (!account?.address) {
                      alert("Please connect your wallet first.");
                      throw new Error("Account address is not defined.");
                    }
                    return claimTo({
                      contract: contract,
                      quantity: BigInt(1),
                      to: account.address,
                    });
                  }}
                  onTransactionConfirmed={async () => {
                      alert("Transaction confirmed!");
                  }}
                  disabled={
                    !account ||
                    isLoadingSupply ||
                    isLoadingClaimCondition ||
                    isSoldOut ||
                    Boolean(dataAvailable && maxSupplyCount > 0 && remainingNFTs <= BigInt(0)) ||
                    !activeClaimCondition
                  }
                >
                  {account ? (isSoldOut ? "Sold Out" : "Claim NFT") : "Connect Wallet to Claim"}
                </TransactionButton>

                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold text-lg"
                  asChild
                  disabled={!contract.address}
                >
                  <a
                    href={collectionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Collection
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden">
                      <Image
                        src={`/placeholder.svg?height=40&width=40&text=${i}`}
                        alt={`Collector ${i}`}
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isLoadingTotalMinted ? (
                    <span className="font-semibold text-foreground animate-pulse">Loading collectors...</span>
                  ) : (
                    <span className="font-semibold text-foreground">{totalMintedCount.toString()} collectors</span>
                  )}
                  {" "}have claimed this NFT
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">About This NFT</h2>
                <p className="text-muted-foreground">
                  This exclusive digital collectible represents the intersection of art and technology. Each piece is
                  uniquely generated and stored on the blockchain, ensuring authenticity and provenance.
                </p>
                <p className="text-muted-foreground">
                  The collection explores themes of digital ownership and scarcity in an increasingly virtual world.
                  Holders gain access to exclusive community benefits and future airdrops.
                </p>
                {/* THAY ĐỔI BẮT ĐẦU: Thêm box "View Portfolio" */}
                <div className="flex items-start gap-4 pt-4"> {/* Thay đổi items-center thành items-start nếu muốn nút portfolio căn chỉnh tốt hơn khi text dài */}
                  <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-background flex-shrink-0">
                    <Image src="/placeholder.svg?height=64&width=64&text=AC" alt="Artist" width={64} height={64} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Created by</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3"> {/* Cho phép wrap trên mobile và align trên desktop */}
                        <p className="text-xl font-bold">nhan pro vip max prenium</p>
                        <Button
                            size="sm" // Kích thước nhỏ
                            variant="outline" // Kiểu outline cho "box"
                            className="mt-1 sm:mt-0 text-xs px-2 py-1 h-auto" // Tùy chỉnh padding và chiều cao, text nhỏ hơn
                            asChild
                        >
                            <a
                            href="https://www.facebook.com/nhan.tran.171750/" 
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            View Portfolio
                            </a>
                        </Button>
                    </div>
                  </div>
                </div>
                {/* THAY ĐỔI KẾT THÚC */}
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Collection Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                    <p className="text-2xl font-bold">
                      {isLoadingMaxSupply ? (<span className="animate-pulse">...</span>) : (maxSupplyCount > BigInt(0) ? maxSupplyCount.toString() : "Unlimited")}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Blockchain</p>
                    <p className="text-2xl font-bold">Sepolia</p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Mint Price</p>
                    <p className="text-2xl font-bold">
                      {mintPriceDisplay}
                    </p>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Royalties</p>
                    <p className="text-2xl font-bold">5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Benefits */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Holder Benefits</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Owning this NFT grants you exclusive access to a range of benefits and features
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 mb-2" />
                <CardTitle>Airdrops</CardTitle>
                <CardDescription>Receive future airdrops from the artist and collaborators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Holders will automatically receive future digital collectibles and tokens as they&apos;re released.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 mb-2" />
                <CardTitle>Governance Rights</CardTitle>
                <CardDescription>Vote on future collection directions and community initiatives</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Have your say in the evolution of the project and help shape its future development.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wallet className="h-8 w-8 mb-2" />
                <CardTitle>Revenue Share</CardTitle>
                <CardDescription>Earn a share of secondary market royalties</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A portion of all secondary sales royalties will be distributed to current holders.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 mb-2" />
                <CardTitle>A sweet kiss kkeeke</CardTitle>
                <CardDescription>Come and kiss meeeeee</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {/* Để trống hoặc thêm nội dung nếu muốn */}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <UsersRound className="h-8 w-8 mb-2" />
                <CardTitle>Hugggg</CardTitle>
                <CardDescription>You can hug meeeeee</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {/* Để trống hoặc thêm nội dung nếu muốn */}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Moon className="h-8 w-8 mb-2" />
                <CardTitle>one night with meeeeee</CardTitle>
                <CardDescription>Just kidding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {/* Để trống hoặc thêm nội dung nếu muốn */}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">© {new Date().getFullYear()} NFT Collection. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
