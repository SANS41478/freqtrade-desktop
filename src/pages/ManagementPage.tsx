import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Shield, Lock, Plus, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function ManagementPage() {
  const queryClient = useQueryClient()

  // Blacklist
  const { data: blacklist } = useQuery({ queryKey: ['blacklist'], queryFn: api.blacklist })
  const [newPair, setNewPair] = useState('')
  const addBlacklistMutation = useMutation({
    mutationFn: () => api.addBlacklist([newPair.trim().toUpperCase()]),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blacklist'] }); setNewPair('') },
  })
  const removeBlacklistMutation = useMutation({
    mutationFn: (pair: string) => api.deleteBlacklist([pair]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blacklist'] }),
  })

  // Locks
  const { data: locks } = useQuery({ queryKey: ['locks'], queryFn: api.locks })
  const [lockPair, setLockPair] = useState('')
  const [lockReason, setLockReason] = useState('manual')
  const addLockMutation = useMutation({
    mutationFn: () => api.addLock(lockPair.trim().toUpperCase(), new Date(Date.now() + 86400000).toISOString(), '*', lockReason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['locks'] }); setLockPair(''); setLockReason('manual') },
  })
  const deleteLockMutation = useMutation({
    mutationFn: (id: number) => api.deleteLock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locks'] }),
  })

  const blacklistPairs = blacklist?.blacklist ?? []
  const lockEntries = locks?.locks ?? []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">交易管理</h2>
        <p className="text-sm text-[#8b949e] mt-0.5">管理黑名单和交易对锁定</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Blacklist */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#f85149]" />
            黑名单 ({blacklistPairs.length})
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPair}
              onChange={(e) => setNewPair(e.target.value.toUpperCase())}
              placeholder="BTC/USDT"
              className="flex-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
              onKeyDown={(e) => e.key === 'Enter' && newPair && addBlacklistMutation.mutate()}
            />
            <button
              onClick={() => newPair && addBlacklistMutation.mutate()}
              disabled={!newPair || addBlacklistMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#f85149]/10 text-[#f85149] border border-[#f85149]/20 hover:bg-[#f85149]/20 disabled:opacity-50 flex items-center gap-1"
            >
              {addBlacklistMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              添加
            </button>
          </div>

          {blacklistPairs.length === 0 ? (
            <p className="text-sm text-[#8b949e] text-center py-6">黑名单为空</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {blacklistPairs.map((pair) => (
                <div key={pair} className="flex items-center justify-between px-3 py-2 rounded bg-[#0d1117] group">
                  <span className="text-sm font-mono text-[#e6edf3]">{pair}</span>
                  <button
                    onClick={() => removeBlacklistMutation.mutate(pair)}
                    disabled={removeBlacklistMutation.isPending}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#f85149]/10 text-[#8b949e] hover:text-[#f85149] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locks */}
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#d2991d]" />
            交易对锁 ({lockEntries.length})
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={lockPair}
              onChange={(e) => setLockPair(e.target.value.toUpperCase())}
              placeholder="BTC/USDT"
              className="w-28 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] font-mono placeholder-[#8b949e]"
              onKeyDown={(e) => e.key === 'Enter' && lockPair && addLockMutation.mutate()}
            />
            <input
              type="text"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder="原因"
              className="flex-1 px-3 py-1.5 rounded-md text-sm bg-[#0d1117] border border-[#21262d] text-[#e6edf3] placeholder-[#8b949e]"
            />
            <button
              onClick={() => lockPair && addLockMutation.mutate()}
              disabled={!lockPair || addLockMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#d2991d]/10 text-[#d2991d] border border-[#d2991d]/20 hover:bg-[#d2991d]/20 disabled:opacity-50 flex items-center gap-1"
            >
              {addLockMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              加锁 (24h)
            </button>
          </div>

          {lockEntries.length === 0 ? (
            <p className="text-sm text-[#8b949e] text-center py-6">无锁定</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {lockEntries.map((lock) => (
                <div key={lock.id} className="flex items-center justify-between px-3 py-2 rounded bg-[#0d1117] group">
                  <div>
                    <span className="text-sm font-mono text-[#e6edf3]">{lock.pair}</span>
                    <span className="text-xs text-[#8b949e] ml-2">{lock.reason || ''}</span>
                  </div>
                  <button
                    onClick={() => lock.id !== undefined && deleteLockMutation.mutate(lock.id)}
                    disabled={deleteLockMutation.isPending}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#f85149]/10 text-[#8b949e] hover:text-[#f85149] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
