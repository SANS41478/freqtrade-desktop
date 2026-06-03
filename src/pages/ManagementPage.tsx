import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Shield, Lock, Plus, Trash2, Loader2, List } from 'lucide-react'

const DURATIONS = [
  { label: '1小时', ms: 3600000 },
  { label: '6小时', ms: 21600000 },
  { label: '12小时', ms: 43200000 },
  { label: '24小时', ms: 86400000 },
  { label: '3天', ms: 259200000 },
  { label: '7天', ms: 604800000 },
]

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
  const [lockDuration, setLockDuration] = useState(86400000)
  const addLockMutation = useMutation({
    mutationFn: () => api.addLock(lockPair.trim().toUpperCase(), new Date(Date.now() + lockDuration).toISOString(), '*', lockReason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['locks'] }); setLockPair(''); setLockReason('manual') },
  })
  const deleteLockMutation = useMutation({
    mutationFn: (id: number) => api.deleteLock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locks'] }),
  })
  const [selectedLocks, setSelectedLocks] = useState<Set<number>>(new Set())
  const deleteLocksBulkMutation = useMutation({
    mutationFn: () => api.deleteLocksBulk(Array.from(selectedLocks)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['locks'] }); setSelectedLocks(new Set()) },
  })

  // Whitelist
  const { data: whitelist } = useQuery({ queryKey: ['whitelist'], queryFn: api.whitelist })

  const blacklistPairs = blacklist?.blacklist ?? []
  const lockEntries = locks?.locks ?? []
  const whitelistPairs = whitelist?.whitelist ?? []

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">交易管理</h2>
        <p className="text-sm text-muted-foreground mt-0.5">管理黑名单、锁定和白名单</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Blacklist */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-destructive" />
            黑名单 ({blacklistPairs.length})
          </h3>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newPair} onChange={(e) => setNewPair(e.target.value.toUpperCase())} placeholder="BTC/USDT"
              className="flex-1 px-3 py-1.5 rounded-md text-sm bg-secondary border border-border font-mono placeholder-muted-foreground"
              onKeyDown={(e) => e.key === 'Enter' && newPair && addBlacklistMutation.mutate()} />
            <button onClick={() => newPair && addBlacklistMutation.mutate()} disabled={!newPair || addBlacklistMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 disabled:opacity-50 flex items-center gap-1">
              {addBlacklistMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} 添加
            </button>
          </div>
          {blacklistPairs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">黑名单为空</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {blacklistPairs.map((pair) => (
                <div key={pair} className="flex items-center justify-between px-3 py-2 rounded bg-secondary/30 group">
                  <span className="text-sm font-mono">{pair}</span>
                  <button onClick={() => removeBlacklistMutation.mutate(pair)} disabled={removeBlacklistMutation.isPending}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locks */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-warning" />
              交易对锁定 ({lockEntries.length})
            </h3>
            {selectedLocks.size > 0 && (
              <button onClick={() => deleteLocksBulkMutation.mutate()} disabled={deleteLocksBulkMutation.isPending}
                className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20">
                批量删除 ({selectedLocks.size})
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-2">
            <input type="text" value={lockPair} onChange={(e) => setLockPair(e.target.value.toUpperCase())} placeholder="BTC/USDT"
              className="w-28 px-3 py-1.5 rounded-md text-sm bg-secondary border border-border font-mono placeholder-muted-foreground"
              onKeyDown={(e) => e.key === 'Enter' && lockPair && addLockMutation.mutate()} />
            <select value={lockDuration} onChange={(e) => setLockDuration(Number(e.target.value))} className="px-2 py-1.5 rounded-md text-xs bg-secondary border border-border">
              {DURATIONS.map((d) => (<option key={d.ms} value={d.ms}>{d.label}</option>))}
            </select>
            <input type="text" value={lockReason} onChange={(e) => setLockReason(e.target.value)} placeholder="原因"
              className="flex-1 px-3 py-1.5 rounded-md text-sm bg-secondary border border-border placeholder-muted-foreground" />
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => lockPair && addLockMutation.mutate()} disabled={!lockPair || addLockMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 disabled:opacity-50 flex items-center gap-1">
              {addLockMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} 加锁
            </button>
          </div>
          {lockEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">无锁定</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {lockEntries.map((lock) => (
                <div key={lock.id} className="flex items-center justify-between px-3 py-2 rounded bg-secondary/30 group">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={selectedLocks.has(lock.id)}
                      onChange={(e) => { const n = new Set(selectedLocks); e.target.checked ? n.add(lock.id) : n.delete(lock.id); setSelectedLocks(n) }}
                      className="rounded border-border" />
                    <div>
                      <span className="text-sm font-mono">{lock.pair}</span>
                      <span className="text-xs text-muted-foreground ml-2">{lock.reason || ''}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteLockMutation.mutate(lock.id)} disabled={deleteLockMutation.isPending}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Whitelist (full width) */}
        <div className="bg-card border border-border rounded-lg p-5 card-glow col-span-2">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <List className="w-4 h-4 text-success" />
            白名单 ({whitelistPairs.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {whitelistPairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">无白名单交易对</p>
            ) : (
              whitelistPairs.map((pair) => (
                <span key={pair} className="px-2.5 py-1 rounded-md text-xs font-mono bg-success/10 text-success border border-success/20">
                  {pair}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}