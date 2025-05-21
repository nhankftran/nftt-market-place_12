"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Sparkles, Shield, Users, Trophy, Zap } from "lucide-react"
import Navbar from "@/components/navbar"
import { sepolia } from "thirdweb/chains"
import { getContract } from "thirdweb"
import { client } from "@/app/client"
import { getContractMetadata } from "thirdweb/extensions/common"
import { useReadContract, useActiveAccount } from "thirdweb/react"
import { MediaRenderer } from "thirdweb/react"
import { claimTo } from "thirdweb/extensions/erc721"
import { TransactionButton } from "thirdweb/react"


export default function Home() {
  const account = useActiveAccount ();
  
  const contract = getContract({
    client: client,
    chain: sepolia,
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
  })

  const { data: contractMetadata } = useReadContract(getContractMetadata, {
    contract: contract,
  })
  console.log(contractMetadata)
  console.log("Image URL:", contractMetadata?.image); // Đặt trước phần return hoặc JSX

  const collectionUrl = contract.address
  ? `https://sepolia.etherscan.io/token/${contract.address}`
  : "#";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="container py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="relative w-full max-w-[450px] aspect-square rounded-xl overflow-hidden border shadow-lg">
              {/* <Image
                src="/placeholder.svg?height=450&width=450"
                alt="Featured NFT"
                fill
                className="object-cover"
                priority
              /> */}
              
              <MediaRenderer
                client={client}
                src={contractMetadata?.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                width="1000"
                height="1000"
                style={{
                  borderRadius: "1rem",
                  boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
                  border: "1px solid #e2e8f0",
                }}
              />
              <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full">
                <Badge variant="secondary" className="font-semibold">
                  #1337
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{contractMetadata?.name}</h1>
              <p className="text-xl text-muted-foreground mb-6">{contractMetadata?.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* <Button size="lg" className="font-semibold text-lg px-8">
                Claim NFT
                <Sparkles className="ml-2 h-5 w-5" />
              </Button> */}
              <TransactionButton
                transaction={() => claimTo({
                  contract: contract,
                  quantity: BigInt(1),
                  to: account?.address as string,
                })}
                onTransactionConfirmed={async () => alert("Transaction confirmed")}
              >
                Claim NFT
              </TransactionButton>

              <Button
                size="lg"
                variant="outline"
                className="font-semibold text-lg"
                asChild
                disabled={!contract.address}
              >
                <a
                  href={collectionUrl} // Sử dụng collectionUrl đã được cập nhật
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
                <span className="font-semibold text-foreground">723 collectors</span> have claimed this NFT
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted/50 py-16">
        <div className="container">
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

              <div className="flex items-center gap-4 pt-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-background">
                  <Image src="/placeholder.svg?height=64&width=64&text=AC" alt="Artist" width={64} height={64} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Created by</h3>
                  <p className="text-xl font-bold">Artistic Coder</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Collection Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-2xl font-bold">1,000</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Blockchain</p>
                  <p className="text-2xl font-bold">Ethereum</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mint Price</p>
                  <p className="text-2xl font-bold">0.08 ETH</p>
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
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Holder Benefits</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Owning this NFT grants you exclusive access to a range of benefits and features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2" />
              <CardTitle>Exclusive Community</CardTitle>
              <CardDescription>Join our private Discord community with other collectors and the artist</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with like-minded collectors, participate in discussions, and get early access to future drops.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 mb-2" />
              <CardTitle>IRL Events</CardTitle>
              <CardDescription>Get access to exclusive in-person events and meetups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Attend gallery openings, conferences, and special events organized exclusively for NFT holders.
              </p>
            </CardContent>
          </Card>

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
              <Sparkles className="h-8 w-8 mb-2" />
              <CardTitle>Merchandise</CardTitle>
              <CardDescription>Get exclusive merchandise featuring your NFT</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Physical items including apparel, prints, and collectibles featuring your specific NFT.
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-auto">
        <div className="container text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} NFT Collection. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
