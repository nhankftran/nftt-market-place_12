// src/app/page.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Wallet, Shield, UsersRound, Moon, Heart, Zap, Flame } from "lucide-react";

import Navbar from "@/components/navbar";
import { sepolia } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { client } from "@/app/client";
import { getContractMetadata } from "thirdweb/extensions/common";
import { useReadContract, useActiveAccount } from "thirdweb/react";
import { MediaRenderer } from "thirdweb/react";
import { claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc721";
import { TransactionButton } from "thirdweb/react";
import { formatEther } from "viem";

// Thêm các import cần thiết cho chức năng đăng ký
import { useState, useEffect } from 'react';
import RegisterForm from '@/components/RegisterForm'; // Import component RegisterForm đã tạo

// Định nghĩa kiểu dữ liệu cho form đăng ký (để đảm bảo đồng bộ)
interface RegistrationFormData {
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'male' | 'female' | 'other' | '';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | '';
}

export default function Home() {
  const account = useActiveAccount(); // Lấy thông tin tài khoản đang hoạt động từ Thirdweb

  // --- State cho chức năng Đăng ký ---
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false); // Riêng cho form đăng ký
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  // --- Kết thúc State cho chức năng Đăng ký ---

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string,
  });

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

  // --- Bắt đầu: Logic cho chức năng Đăng ký ---

  // Hàm kiểm tra trạng thái đăng ký của ví
  const checkRegistrationStatus = async (walletAddressToCheck: string) => {
    setIsLoadingForm(true);
    setRegistrationError(null);
    setRegistrationMessage(null);
    try {
      // Gọi API backend để kiểm tra
      const response = await fetch(`/api/user-status?walletAddress=${walletAddressToCheck}`);
      const data = await response.json();

      if (response.ok) {
        setIsRegistered(data.isRegistered);
        if (!data.isRegistered) {
          setShowRegistrationForm(true); // Hiển thị form nếu chưa đăng ký
          setRegistrationMessage('Vui lòng đăng ký tài khoản để tiếp tục.');
        } else {
          setShowRegistrationForm(false); // Ẩn form nếu đã đăng ký
          setRegistrationMessage('Bạn đã đăng ký tài khoản. Chào mừng quay trở lại!');
        }
      } else {
        // Xử lý các lỗi HTTP khác từ backend
        setRegistrationError(data.message || 'Lỗi khi kiểm tra trạng thái đăng ký.');
        setShowRegistrationForm(true); // Vẫn hiển thị form để user đăng ký lại hoặc lần đầu
      }
    } catch (err) {
      console.error('Lỗi khi gọi API kiểm tra trạng thái:', err);
      setRegistrationError('Không thể kết nối server để kiểm tra trạng thái đăng ký.');
      setShowRegistrationForm(true); // Vẫn hiển thị form nếu có lỗi kết nối
    } finally {
      setIsLoadingForm(false);
    }
  };

  // Hàm xử lý việc gửi dữ liệu đăng ký từ RegisterForm
  const handleRegisterSubmit = async (formData: RegistrationFormData) => {
    setIsLoadingForm(true);
    setRegistrationError(null);
    setRegistrationMessage(null);
    try {
      if (!account?.address) {
        setRegistrationError('Vui lòng kết nối ví trước khi đăng ký.');
        setIsLoadingForm(false);
        return;
      }

      // Gửi dữ liệu đến API backend để lưu
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, walletAddress: account.address }), // Gửi cả địa chỉ ví
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationMessage('Đăng ký thành công! Bạn có thể tiếp tục sử dụng DApp.');
        setIsRegistered(true);
        setShowRegistrationForm(false); // Ẩn form sau khi đăng ký thành công
      } else {
        setRegistrationError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu đăng ký:', err);
      setRegistrationError('Lỗi kết nối server khi đăng ký.');
    } finally {
      setIsLoadingForm(false);
    }
  };

  // Sử dụng useEffect để kiểm tra trạng thái đăng ký mỗi khi account thay đổi (kết nối/ngắt kết nối ví)
  useEffect(() => {
    if (account?.address) {
      checkRegistrationStatus(account.address);
    } else {
      // Reset trạng thái nếu ví không được kết nối
      setIsRegistered(false);
      setShowRegistrationForm(false);
      setRegistrationError(null);
      setRegistrationMessage('Vui lòng kết nối ví.');
    }
  }, [account?.address]); // Dependency array: chạy lại khi account.address thay đổi

  // --- Kết thúc: Logic cho chức năng Đăng ký ---

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

              {/* THAY ĐỔI DÒNG THÔNG BÁO SỐ LƯỢNG NFT CÒN LẠI */}
              {isLoadingSupply && (
                <p className="text-lg font-semibold text-muted-foreground mb-4 animate-pulse">
                  Loading supply...
                </p>
              )}
              {!isLoadingSupply && canShowLimitedSupply && (
                <p className="text-2xl font-bold mb-4 flex items-center justify-center sm:justify-start">
                  <Flame className="mr-2 h-7 w-7 text-orange-500" /> {/* Biểu tượng lửa vẫn hợp lý */}
                  <span className="animated-vibrant-gradient-text"> {/* Sử dụng class gradient mới */}
                    🔥 Only {remainingNFTs.toString()} NFTs left! Secure yours NOW before its too late!
                  </span>
                </p>
              )}
              {!isLoadingSupply && isSoldOut && maxSupplyCount > 0 && (
                <p className="text-2xl font-bold text-red-600 mb-4 flex items-center justify-center sm:justify-start">
                  SOLD OUT!
                </p>
              )}
              {/* KẾT THÚC THAY ĐỔI */}

              {/* --- Bắt đầu: Logic hiển thị Form Đăng ký hoặc nút Claim NFT --- */}
              {account?.address ? ( // Nếu ví đã kết nối
                <>
                  {isLoadingForm ? ( // Đang kiểm tra trạng thái đăng ký
                    <p className="text-lg font-semibold text-blue-500 mb-4">Đang kiểm tra trạng thái đăng ký...</p>
                  ) : (
                    <>
                      {registrationError && <p className="text-red-600 text-sm mb-4">{registrationError}</p>}
                      {registrationMessage && <p className="text-green-600 text-sm mb-4">{registrationMessage}</p>}

                      {!isRegistered && showRegistrationForm ? ( // Nếu chưa đăng ký và cần hiển thị form
                        <RegisterForm
                          onSubmit={handleRegisterSubmit}
                          isLoading={isLoadingForm}
                          error={registrationError}
                        />
                      ) : ( // Nếu đã đăng ký, hiển thị nút Claim NFT và các chức năng chính
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
                              || !isRegistered // Disable nếu chưa đăng ký
                            }
                          >
                            {isRegistered ? (isSoldOut ? "Sold Out" : "Claim NFT") : "Đăng ký để Claim"}
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
                      )}
                    </>
                  )}
                </>
              ) : ( // Nếu ví chưa kết nối, chỉ hiển thị nút Connect Wallet (thường là ở Navbar, nhưng thêm ở đây cho rõ ràng)
                <div className="flex flex-col sm:flex-row gap-4">
                  <p className="text-xl text-red-500 font-semibold">Vui lòng kết nối ví để tiếp tục.</p>
                  {/* Navbar của bạn có nút Connect Wallet, nhưng bạn có thể thêm một nút lớn ở đây nữa nếu muốn */}
                </div>
              )}
              {/* --- Kết thúc: Logic hiển thị Form Đăng ký hoặc nút Claim NFT --- */}


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
                <div className="flex items-center gap-4 pt-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-background">
                    <Image src="/placeholder.svg?height=64&width=64&text=AC" alt="Artist" width={64} height={64} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Created by</h3>
                    <p className="text-xl font-bold">sinh viên EUEH</p>
                  </div>
                </div>
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
              L</CardHeader>
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
  );
}