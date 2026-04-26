"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ethers } from "ethers"
import { getProvider, decodeInput } from "@/lib/ethers"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Box, Hash, User, ArrowRight, Zap, Database, Terminal, List, Shield } from "lucide-react"

export default function TransactionPage() {
  const { hash } = useParams()
  const [tx, setTx] = useState<ethers.TransactionResponse | null>(null)
  const [receipt, setReceipt] = useState<ethers.TransactionReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const provider = getProvider()

    async function fetchDetails() {
      try {
        const [txData, receiptData] = await Promise.all([
          provider.getTransaction(hash as string),
          provider.getTransactionReceipt(hash as string)
        ])
        setTx(txData)
        setReceipt(receiptData)
      } catch (err) {
        console.error("Failed to fetch tx:", err)
      } finally {
        setLoading(false)
      }
    }

    if (hash) fetchDetails()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
        <Link href="/" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    )
  }

  const decoded = decodeInput(tx.data)
  const isFHE = tx.data.length > 50

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Transaction Details
            </h1>
          </div>
          {isFHE && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1 text-sm font-semibold animate-pulse">
              FHE SHIELDED
            </Badge>
          )}
        </div>

        <div className="grid gap-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0a0a0a] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Hash size={14} /> Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={receipt?.status === 1 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                  {receipt?.status === 1 ? "Success" : "Failed"}
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-[#0a0a0a] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Box size={14} /> Block
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono text-blue-400">#{tx.blockNumber}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0a0a0a] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Zap size={14} /> Gas Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono">{receipt?.gasUsed.toString() ?? "0"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Details Table */}
          <Card className="bg-[#0a0a0a] border-white/5">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <div className="grid grid-cols-1 md:grid-cols-4 p-4 items-center">
                  <div className="text-white/40 text-sm flex items-center gap-2"><Hash size={14} /> Transaction Hash</div>
                  <div className="md:col-span-3 font-mono text-sm break-all">{tx.hash}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 p-4 items-center">
                  <div className="text-white/40 text-sm flex items-center gap-2"><User size={14} /> From</div>
                  <div className="md:col-span-3 font-mono text-sm break-all text-blue-400">{tx.from}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 p-4 items-center">
                  <div className="text-white/40 text-sm flex items-center gap-2"><ArrowRight size={14} /> To</div>
                  <div className="md:col-span-3 font-mono text-sm break-all text-blue-400">{tx.to || "Contract Creation"}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 p-4 items-center">
                  <div className="text-white/40 text-sm flex items-center gap-2"><Database size={14} /> Value</div>
                  <div className="md:col-span-3 font-mono">{ethers.formatEther(tx.value)} INIT</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shielded Data Breakdown */}
          {decoded && (
             <Card className="bg-[#0a0a0a] border-purple-500/30 border-dashed">
             <CardHeader className="bg-purple-500/5">
               <CardTitle className="text-xs uppercase tracking-[0.2em] font-black flex items-center gap-2 text-purple-400">
                 <Shield size={14} /> Shielded Execution: {tx.data.slice(0, 10)}
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                 {Object.entries(decoded.args).map(([key, value], idx) => (
                   <div key={key} className="grid grid-cols-1 md:grid-cols-4 p-4 items-center">
                     <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Shielded Segment {idx}</div>
                     <div className="md:col-span-3 font-mono text-[10px] break-all text-purple-200/40">
                       {String(value)}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
          )}

          {/* Events/Logs */}
          {receipt && receipt.logs.length > 0 && (
            <Card className="bg-[#0a0a0a] border-white/5">
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <List size={14} className="text-blue-400" /> Emission Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {receipt.logs.map((log, i) => {
                    return (
                      <div key={i} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-white/5 text-white/40 border-white/10 text-[10px] uppercase font-black">
                            Shielded Event {i}
                          </Badge>
                          <span className="text-[10px] text-white/10 font-mono">{log.address}</span>
                        </div>
                        <div className="grid gap-2">
                           <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                              <div className="text-white/20 text-[10px] font-bold uppercase">Data</div>
                              <div className="md:col-span-3 font-mono text-[10px] break-all text-white/20">
                                {log.data}
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Input Data */}
          <Card className="bg-[#0a0a0a] border-white/5">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-white/20 flex items-center gap-2 font-black">
                <Terminal size={14} /> Ciphertext Payload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 p-4 rounded-lg font-mono text-[10px] break-all max-h-48 overflow-y-auto text-white/10">
                {tx.data}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
