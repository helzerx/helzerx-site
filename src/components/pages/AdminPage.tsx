import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Server,
  Image as ImageIcon,
  CreditCard,
  LifeBuoy,
  Receipt,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  DollarSign,
  Users,
  Shield,
  Activity,
  Globe,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Handshake,
  Star,
  Award,
  Upload,
  ShieldCheck,
  Lock,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Radio,
  AlertTriangle,
  Fingerprint,
  KeyRound,
  Ban,
  Check,
  Zap,
  Smartphone,
  Download,
} from 'lucide-react';
import { HostingPlan, ServiceItem, BlogPost, Partner, CustomerReview } from '../../types';

export const AdminPage: React.FC = () => {
  const {
    user,
    plans,
    addPlan,
    updatePlan,
    deletePlan,
    services,
    addService,
    updateService,
    deleteService,
    games,
    updateGame,
    partners,
    addPartner,
    updatePartner,
    deletePartner,
    reviews,
    addReview,
    updateReview,
    deleteReview,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    paymentSettings,
    updatePaymentSettings,
    tickets,
    invoices,
    deployedServers,
    serverNodes,
    siteSettings,
    updateSiteSettings,
    siteImages,
    updateSiteImages,
    formatPrice,
    setActiveTicketModal,
    setActiveInvoiceModal,
    payInvoice,
    currency,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'nodes' | 'plans' | 'services' | 'partners' | 'reviews' | 'images' | 'gateways' | 'tickets' | 'invoices' | 'settings'
  >('overview');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<HostingPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Service Edit State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);

  // Partner Edit State
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isAddingPartner, setIsAddingPartner] = useState(false);

  // Review Edit State
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Media/Image asset URLs state

  const showNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Plan Handlers
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (isAddingPlan) {
      addPlan(editingPlan);
      setIsAddingPlan(false);
    } else {
      updatePlan(editingPlan.id, editingPlan);
    }
    setEditingPlan(null);
    showNotification();
  };

  // Service Handlers
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (isAddingService) {
      addService(editingService);
      setIsAddingService(false);
    } else {
      updateService(editingService.id, editingService);
    }
    setEditingService(null);
    showNotification();
  };

  return (
    <div className="helzerx-admin-page fixed inset-0 z-[80] min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_12%_8%,rgba(96,165,250,0.22),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(129,140,248,0.16),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f5f9ff_48%,#eef6ff_100%)] py-5 sm:py-8"><div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
            HelzerX Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage the HelzerX catalog, billing, support, media and site configuration from one place.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Changes saved</span>
          </div>
        )}
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'nodes', label: `Infrastructure (${serverNodes.length})`, icon: Server },
          { id: 'plans', label: `Plans (${plans.length})`, icon: Server },
          { id: 'services', label: `Services (${services.length})`, icon: Layers },
          { id: 'partners', label: `Partners (${partners.length})`, icon: Handshake },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'images', label: 'Images & Media', icon: ImageIcon },
          { id: 'gateways', label: 'Payment Gateways', icon: CreditCard },
          { id: 'tickets', label: `Tickets (${tickets.length})`, icon: LifeBuoy },
          { id: 'invoices', label: `Invoices (${invoices.length})`, icon: Receipt },
          { id: 'settings', label: 'Site Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeAdminTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : tab.highlight
                  ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-900/40'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: OVERVIEW METRICS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/90 border border-slate-200 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-semibold">Total Platform Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {formatPrice(
                  invoices
                    .filter((i) => i.status === 'paid')
                    .reduce((acc, c) => acc + c.amountUsd, 0)
                )}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
                {currency.code === 'LKR' ? 'Settled in LKR (Rs.)' : 'Automated Gateways Active'}
              </span>
            </div>

            <div className="bg-white/90 border border-slate-200 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-semibold">Provisioned Nodes</span>
                <Server className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {deployedServers.length} Active
              </p>
              <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
                Configured deployment records
              </span>
            </div>

            <div className="bg-white/90 border border-slate-200 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-semibold">Open Support Tickets</span>
                <LifeBuoy className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {tickets.filter((t) => t.status !== 'Closed').length} Pending
              </p>
              <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                Review and respond from the Tickets section
              </span>
            </div>

            <div className="bg-white/90 border border-slate-200 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-semibold">Total Catalog Plans</span>
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {plans.length} Configured
              </p>
              <span className="text-[10px] text-purple-400 font-mono mt-1 block">
                Across {games.length} Game Titles
              </span>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white/90 border border-slate-200 rounded-3xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setIsAddingPlan(true);
                  setEditingPlan({
                    id: 'plan-' + Date.now(),
                    slug: '',
                    gameId: games[0]?.id || '',
                    serviceType: 'game-hosting',
                    name: '',
                    subtitle: '',
                    monthlyPrice: 0,
                    ram: '',
                    cpu: '',
                    storage: '',
                    players: '',
                    tier: 'Starter',
                    popular: false,
                    features: [],
                    status: 'active',
                  });
                  setActiveAdminTab('plans');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-cyan-500/10 border border-slate-100 hover:border-cyan-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-3 text-cyan-400 mb-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-bold text-sm text-slate-900 group-hover:text-cyan-300">
                    Add New Hosting Plan
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Configure RAM, CPU, pricing, and features for any game.
                </p>
              </button>

              <button
                onClick={() => setActiveAdminTab('gateways')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-500/10 border border-slate-100 hover:border-blue-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-3 text-blue-400 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-bold text-sm text-slate-900 group-hover:text-blue-300">
                    Payment gateways
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage merchant credentials, currency rates, and crypto wallets.
                </p>
              </button>

              <button
                onClick={() => setActiveAdminTab('images')}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-500/10 border border-slate-100 hover:border-purple-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-3 text-purple-400 mb-2">
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-bold text-sm text-slate-900 group-hover:text-purple-300">
                    Website media
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Change hero banners, game artwork, and promo graphics.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: CLOUD INFRASTRUCTURE NODES */}
      {activeAdminTab === 'nodes' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 font-display">
                Global Cloud Clusters &amp; Datacenter Nodes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time telemetry, memory utilization, and container orchestration across 6 core datacenters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  showNotification();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Node Telemetry</span>
              </button>
            </div>
          </div>

          {/* Grid of 6 Cloud Clusters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodeClusters.map((cluster) => (
              <div
                key={cluster.id}
                className="bg-white/90 border border-slate-200 rounded-3xl p-6 space-y-5 hover:border-cyan-500/30 transition shadow-xl"
              >
                {/* Node Title & Status */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cluster.flag}</span>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-base">
                        {cluster.name}
                      </h4>
                      <p className="text-xs text-slate-500">{cluster.location}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cluster.maintenance
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        cluster.maintenance ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    <span>{cluster.maintenance ? 'Maintenance' : 'Armed'}</span>
                  </span>
                </div>

                {/* Processor info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    CPU Architecture
                  </span>
                  <p className="text-xs font-bold text-cyan-300 font-mono truncate">
                    {cluster.cpu}
                  </p>
                </div>

                {/* Gauges: CPU & RAM */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">CPU Compute Load</span>
                      <span className="text-slate-900 font-mono">{cluster.load}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${cluster.load}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">RAM Allocated</span>
                      <span className="text-slate-900 font-mono">{cluster.ram}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: '45%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Telemetry Footer */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Ping</span>
                    <span className="font-mono font-bold text-emerald-400">{cluster.latency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SLA</span>
                    <span className="font-mono font-bold text-slate-900">{cluster.uptime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">NVMe Gen5</span>
                    <span className="font-mono font-bold text-cyan-300">RAID-10</span>
                  </div>
                </div>

                {/* Node Controls */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      showNotification();
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Flush Cache</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNodeClusters((prev) =>
                        prev.map((c) =>
                          c.id === cluster.id ? { ...c, maintenance: !c.maintenance } : c
                        )
                      );
                      showNotification();
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      cluster.maintenance
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                    }`}
                  >
                    <span>{cluster.maintenance ? 'Bring Online' : 'Maintenance'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
      {activeAdminTab === 'plans' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hosting Plans Management</h3>
              <p className="text-xs text-slate-500">
                Add, edit, remove, and customize all hosting plans and pricing.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingPlan(true);
                setEditingPlan({
                  id: 'plan-' + Date.now(),
                  gameId: 'minecraft',
                  name: 'New Node Plan',
                  subtitle: 'Optimized Server',
                  monthlyPrice: 14.99,
                  ram: '8 GB DDR5',
                  cpu: '3 vCPU Ryzen 9 9950X',
                  storage: '80 GB NVMe Gen5',
                  players: '60 Slots',
                  tier: 'Standard',
                  popular: false,
                  features: ['Instant 15s Setup', 'Corero 3.2Tbps DDoS Protection', 'Automated Backups'],
                });
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </button>
          </div>

          {/* Plan Edit Modal/Drawer */}
          {editingPlan && (
            <form
              onSubmit={handleSavePlan}
              className="bg-[#111422] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in"
            >
              <h4 className="text-base font-bold text-slate-900 mb-6">
                {isAddingPlan ? 'Add New Hosting Plan' : `Edit Plan: ${editingPlan.name}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Target Game</label>
                  <select
                    value={editingPlan.gameId}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, gameId: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  >
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, name: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Monthly Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingPlan.monthlyPrice}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        monthlyPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">RAM Spec</label>
                  <input
                    type="text"
                    value={editingPlan.ram}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, ram: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">CPU Spec</label>
                  <input
                    type="text"
                    value={editingPlan.cpu}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, cpu: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Storage Spec</label>
                  <input
                    type="text"
                    value={editingPlan.storage}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, storage: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Player Slots</label>
                  <input
                    type="text"
                    value={editingPlan.players}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, players: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, popular: e.target.checked })
                    }
                    className="rounded accent-cyan-500"
                  />
                  <span>Mark as "Most Popular" Tier</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Plans Table */}
          <div className="bg-white/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#131624] text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-6">Plan Name</th>
                    <th className="py-4 px-6">Game</th>
                    <th className="py-4 px-6">RAM</th>
                    <th className="py-4 px-6">CPU</th>
                    <th className="py-4 px-6">Storage</th>
                    <th className="py-4 px-6">Price ($ USD)</th>
                    <th className="py-4 px-6">Price (LKR)</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 text-slate-600">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.popular && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-2 py-0.5 rounded font-mono uppercase">
                            Popular
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 capitalize text-slate-500">{p.gameId}</td>
                      <td className="py-4 px-6 font-medium">{p.ram}</td>
                      <td className="py-4 px-6 font-medium">{p.cpu}</td>
                      <td className="py-4 px-6 font-medium">{p.storage}</td>
                      <td className="py-4 px-6 font-mono font-bold text-cyan-400">
                        ${p.monthlyPrice.toFixed(2)}/mo
                      </td>
                      <td className="py-4 px-6 font-mono text-emerald-400">
                        Rs. {Math.round(p.monthlyPrice * 305).toLocaleString()}/mo
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setIsAddingPlan(false);
                              setEditingPlan({ ...p });
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePlan(p.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-900"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICES MANAGEMENT */}
      {activeAdminTab === 'services' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Services & Cloud Products</h3>
              <p className="text-xs text-slate-500">
                Manage cloud computing, dedicated nodes, bot hosting, and web solutions.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddingService(true);
                setEditingService({
                  id: 'srv-' + Date.now(),
                  title: 'New Cloud Service',
                  description: 'High-availability infrastructure for scalable apps.',
                  startingPrice: 12.0,
                  icon: 'Server',
                  features: ['Unmetered Bandwidth', 'Dedicated IPv4', 'Instant Provisioning'],
                  active: true,
                  category: 'Cloud Compute',
                });
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Edit Service Drawer */}
          {editingService && (
            <form
              onSubmit={handleSaveService}
              className="bg-[#111422] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in"
            >
              <h4 className="text-base font-bold text-slate-900 mb-6">
                {isAddingService ? 'Add New Service' : `Edit: ${editingService.title}`}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Service Title</label>
                  <input
                    type="text"
                    required
                    value={editingService.title}
                    onChange={(e) =>
                      setEditingService({ ...editingService, title: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingService.category || 'Cloud Compute'}
                    onChange={(e) =>
                      setEditingService({ ...editingService, category: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Starting Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingService.startingPrice}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        startingPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-500 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          )}

          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white/90 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {srv.category || 'Service'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatPrice(srv.startingPrice)}/mo
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{srv.title}</h4>
                  <p className="text-xs text-slate-500 mb-4">{srv.description}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsAddingService(false);
                      setEditingService({ ...srv });
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteService(srv.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PARTNERS TICKER & MANAGEMENT */}
      {activeAdminTab === 'partners' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Official Partners Bar & Network</h3>
                <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  {partners.length} Active Partners
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Customize partner logos, titles, taglines, category badges, and external links displayed on the homepage marquee ticker.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPartner({
                  id: 'part-' + Date.now(),
                  name: '',
                  category: 'Esports & Community',
                  tagline: '',
                  accent: 'from-amber-400 to-orange-500',
                  glow: 'shadow-orange-500/20',
                  iconBg: 'bg-orange-500/10 text-orange-400',
                  active: true,
                });
                setIsAddingPartner(true);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className={`bg-white/90 border ${
                  partner.isSpecial ? 'border-yellow-500/40' : 'border-slate-200'
                } rounded-3xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-black text-sm shrink-0 ${
                          partner.iconBg || 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {partner.logoUrl ? (
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : partner.isSpecial ? (
                          <Award className="w-6 h-6 text-yellow-300" />
                        ) : (
                          <span>{partner.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-300 transition-colors">
                            {partner.name}
                          </h4>
                          {partner.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                              {partner.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-purple-400 font-medium">
                          {partner.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsAddingPartner(false);
                          setEditingPartner({ ...partner });
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Partner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${partner.name}?`)) {
                            deletePartner(partner.id);
                            showNotification();
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-900 transition-colors"
                        title="Delete Partner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {partner.tagline || partner.description}
                  </p>

                  {partner.url && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline truncate max-w-full"
                    >
                      <span>{partner.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      updatePartner(partner.id, { active: partner.active === false ? true : false });
                      showNotification();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      partner.active !== false
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {partner.active !== false ? '● Active in Ticker' : '○ Hidden'}
                  </button>

                  <button
                    onClick={() => {
                      setIsAddingPartner(false);
                      setEditingPartner({ ...partner });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900"
                  >
                    Configure &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: CUSTOMER REVIEWS & TESTIMONIALS */}
      {activeAdminTab === 'reviews' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Customer & Player Reviews</h3>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {reviews.length} Reviews
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage live player reviews, Trustpilot ratings, client badges, and quote feedback.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingReview({
                  id: 'rev-' + Date.now(),
                  name: '',
                  role: 'Minecraft Server Owner',
                  serverType: 'PaperMC 1.20.4',
                  rating: 5,
                  reviewText: '',
                  verified: true,
                  date: 'Just now',
                  avatar: 'AR',
                  avatarBg: 'from-emerald-600 to-teal-700',
                  active: true,
                });
                setIsAddingReview(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white/90 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {rev.avatarImage ? (
                        <img
                          src={rev.avatarImage}
                          alt={rev.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-2xl object-cover border border-white/20"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${
                            rev.avatarBg || 'from-purple-600 to-indigo-700'
                          } text-slate-900 font-black text-xs flex items-center justify-center shadow-md border border-white/20 shrink-0`}
                        >
                          {rev.avatar || rev.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-300 transition-colors">
                            {rev.name}
                          </h4>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-[#00b67a]/20 text-[#00b67a] px-1.5 py-0.2 rounded border border-[#00b67a]/30">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {rev.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsAddingReview(false);
                          setEditingReview({ ...rev });
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete review from ${rev.name}?`)) {
                            deleteReview(rev.id);
                            showNotification();
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-900 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (rev.rating || 5) ? 'bg-[#00b67a]' : 'bg-slate-700'
                        } flex items-center justify-center rounded-[2px]`}
                      >
                        <Star className="w-2.5 h-2.5 text-slate-900 fill-white" />
                      </div>
                    ))}
                    <span className="text-xs text-slate-500 ml-1 font-mono">
                      {rev.rating || 5}.0 Stars
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic line-clamp-3 mb-3">
                    &ldquo;{rev.reviewText}&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-purple-300">
                    {rev.serverType || 'Verified Client'}
                  </span>
                  <span className="text-slate-500">{rev.date || 'Recently'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: IMAGES & MEDIA ASSETS MANAGER */}
      {activeAdminTab === 'images' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Images & Media Asset Manager</h3>
            <p className="text-xs text-slate-500">
              Change hero banners, game covers, control panel screenshots, and site graphic assets in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Background Banner */}
            <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Hero Section Main Banner</h4>
              <div className="h-40 rounded-2xl overflow-hidden mb-4 bg-black/40 border border-slate-100">
                <img src={siteImages.heroBackgroundUrl} alt="Hero Banner" className="w-full h-full object-cover" />
              </div>
              <label className="text-xs text-slate-500 block mb-1.5">Direct Image URL</label>
              <input
                type="text"
                value={siteImages.heroBackgroundUrl}
                onChange={(e) => updateSiteImages({ heroBackgroundUrl: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono mb-3"
              />
              <button
                onClick={showNotification}
                className="bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Update Banner
              </button>
            </div>

            {/* Game Artwork Cards */}
            <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Game Directory Artwork</h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {games.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 bg-[#0a0b12] p-2.5 rounded-xl border border-slate-100">
                    <img src={g.image} alt={g.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{g.name}</p>
                      <input
                        type="text"
                        value={g.image}
                        onChange={(e) => updateGame(g.id, { image: e.target.value })}
                        className="w-full bg-black/40 border border-slate-100 rounded px-2 py-1 text-[10px] text-slate-600 font-mono mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PAYMENT GATEWAYS CONFIGURATION */}
      {activeAdminTab === 'gateways' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Payment Gateways & Currency Configuration</h3>
            <p className="text-xs text-slate-500">
              Configure PayHere (Sri Lanka LKR & International), PayPal Smart Checkout, Crypto USDT/BTC, and Bank Wire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PayHere Sri Lanka */}
            <div className="bg-white/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  PayHere Gateway (Sri Lanka LKR / Cards)
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Enabled
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">PayHere Merchant ID</label>
                  <input
                    type="text"
                    value={paymentSettings.payhereMerchantId}
                    onChange={(e) =>
                      updatePaymentSettings({ payhereMerchantId: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">PayHere Merchant Secret</label>
                  <input
                    type="password"
                    value={paymentSettings.payhereSecret}
                    onChange={(e) =>
                      updatePaymentSettings({ payhereSecret: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div className="bg-white/90 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                  PayPal Smart Checkout
                </h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Enabled
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">PayPal Client ID</label>
                  <input
                    type="text"
                    value={paymentSettings.paypalClientId}
                    onChange={(e) =>
                      updatePaymentSettings({ paypalClientId: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Auto-Capture Payments</label>
                  <div className="p-3 bg-[#0a0b12] rounded-xl text-xs text-slate-600 flex items-center justify-between">
                    <span>Instant Server Provisioning on Capture</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crypto USDT/BTC */}
            <div className="bg-white/90 border border-purple-500/30 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">
                Crypto Wallets (USDT / BTC)
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">USDT (TRC20) Address</label>
                  <input
                    type="text"
                    value={paymentSettings.cryptoUsdtAddress}
                    onChange={(e) =>
                      updatePaymentSettings({ cryptoUsdtAddress: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Bitcoin (BTC) Address</label>
                  <input
                    type="text"
                    value={paymentSettings.cryptoBtcAddress}
                    onChange={(e) =>
                      updatePaymentSettings({ cryptoBtcAddress: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-amber-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="bg-white/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
                Bank Transfer & Wire Account
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={paymentSettings.bankName}
                    onChange={(e) =>
                      updatePaymentSettings({ bankName: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={paymentSettings.bankAccountNumber}
                    onChange={(e) =>
                      updatePaymentSettings({ bankAccountNumber: e.target.value })
                    }
                    className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-2.5 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: SUPPORT TICKETS MANAGER */}
      {activeAdminTab === 'tickets' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Customer Support Ticket Desk</h3>
            <p className="text-xs text-slate-500">
              View and reply to all active user tickets directly as Staff/Admin.
            </p>
          </div>

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setActiveTicketModal(ticket)}
                className="cursor-pointer bg-white/90 hover:bg-[#141727] border border-slate-200 rounded-2xl p-5 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {ticket.ticketNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                    <span className="text-xs text-slate-500">
                      {ticket.userName} ({ticket.userEmail}) • {ticket.department}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      ticket.status === 'Closed'
                        ? 'bg-slate-800 text-slate-500'
                        : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-xs text-cyan-400 font-semibold">Reply →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: INVOICES LIST */}
      {activeAdminTab === 'invoices' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Client Invoices</h3>
            <p className="text-xs text-slate-500">
              Inspect generated billing statements and transaction histories.
            </p>
          </div>

          <div className="bg-white/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#131624] text-slate-500 uppercase text-[10px]">
                    <th className="py-4 px-6">Invoice #</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Gateway</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 text-slate-600">
                      <td className="py-4 px-6 font-mono font-bold text-cyan-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">{inv.userName}</td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {formatPrice(inv.amountUsd)}
                      </td>
                      <td className="py-4 px-6 uppercase font-mono text-[11px] text-slate-500">
                        {inv.paymentGateway || 'PayHere'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setActiveInvoiceModal(inv)}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: SITE BRANDING & SETTINGS */}
      {activeAdminTab === 'settings' && (
        <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-3xl shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Website Branding & Content Customization</h3>
            <p className="text-xs text-slate-500">
              Update your site title, hero headlines, badges, support channels, and promotional banners in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Website Brand Name</label>
              <input
                type="text"
                value={siteSettings.brandName || ''}
                onChange={(e) => updateSiteSettings({ brandName: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Hero Top Badge Text</label>
              <input
                type="text"
                value={siteSettings.heroBadgeText || ''}
                onChange={(e) => updateSiteSettings({ heroBadgeText: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Hero Headline Line 1</label>
              <input
                type="text"
                value={siteSettings.heroTitleLine1 || ''}
                onChange={(e) => updateSiteSettings({ heroTitleLine1: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Hero Headline Line 2</label>
              <input
                type="text"
                value={siteSettings.heroTitleLine2 || ''}
                onChange={(e) => updateSiteSettings({ heroTitleLine2: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Hero Subtitle & Description</label>
              <textarea
                rows={2}
                value={siteSettings.heroSubtitle || ''}
                onChange={(e) => updateSiteSettings({ heroSubtitle: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Global Announcement Bar Text</label>
              <input
                type="text"
                value={siteSettings.announcementText || ''}
                onChange={(e) => updateSiteSettings({ announcementText: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Switch Promo Coupon Code & %</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={siteSettings.switchCouponCode || ''}
                  onChange={(e) => updateSiteSettings({ switchCouponCode: e.target.value })}
                  className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="CODE"
                />
                <input
                  type="number"
                  value={siteSettings.switchDiscountPercent || 10}
                  onChange={(e) =>
                    updateSiteSettings({ switchDiscountPercent: parseInt(e.target.value) || 0 })
                  }
                  className="w-24 bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="%"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Discord Server URL</label>
              <input
                type="text"
                value={siteSettings.discordUrl || ''}
                onChange={(e) => updateSiteSettings({ discordUrl: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-1.5 font-semibold">Support Email</label>
              <input
                type="email"
                value={siteSettings.supportEmail || ''}
                onChange={(e) => updateSiteSettings({ supportEmail: e.target.value })}
                className="w-full bg-[#0a0b12] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings auto-save directly to browser storage &amp; live site
            </span>
            <button
              onClick={showNotification}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD PARTNER */}
      {(editingPartner || isAddingPartner) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white/90 border border-purple-500/30 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Handshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAddingPartner ? 'Add Official Partner' : `Edit Partner: ${editingPartner?.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure logo, link, description & badge</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPartner(null);
                  setIsAddingPartner(false);
                }}
                className="p-1 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Partner / Brand Name</label>
                  <input
                    type="text"
                    value={editingPartner?.name || ''}
                    onChange={(e) =>
                      setEditingPartner(editingPartner ? { ...editingPartner, name: e.target.value } : null)
                    }
                    placeholder="e.g. GAMESTER LK"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editingPartner?.category || ''}
                    onChange={(e) =>
                      setEditingPartner(editingPartner ? { ...editingPartner, category: e.target.value } : null)
                    }
                    placeholder="e.g. Esports, SMP Community"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tagline (Shown in scrolling ticker)</label>
                <input
                  type="text"
                  value={editingPartner?.tagline || ''}
                  onChange={(e) =>
                    setEditingPartner(editingPartner ? { ...editingPartner, tagline: e.target.value } : null)
                  }
                  placeholder="e.g. Leading Gaming Community in Sri Lanka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Logo URL (PNG / SVG / WebP Image)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingPartner?.logoUrl || ''}
                    onChange={(e) =>
                      setEditingPartner(editingPartner ? { ...editingPartner, logoUrl: e.target.value } : null)
                    }
                    placeholder="https://.../logo.png or upload"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono"
                  />
                  <label className="bg-purple-950 hover:bg-purple-900 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            if (editingPartner && uploadEvent.target?.result) {
                              setEditingPartner({
                                ...editingPartner,
                                logoUrl: uploadEvent.target.result as string,
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Website / Discord URL</label>
                <input
                  type="text"
                  value={editingPartner?.url || ''}
                  onChange={(e) =>
                    setEditingPartner(editingPartner ? { ...editingPartner, url: e.target.value } : null)
                  }
                  placeholder="https://discord.gg/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={editingPartner?.badge || ''}
                    onChange={(e) =>
                      setEditingPartner(editingPartner ? { ...editingPartner, badge: e.target.value } : null)
                    }
                    placeholder="e.g. Gold Winner 2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gradient Theme</label>
                  <select
                    value={editingPartner?.accent || 'from-amber-400 to-orange-500'}
                    onChange={(e) =>
                      setEditingPartner(editingPartner ? { ...editingPartner, accent: e.target.value } : null)
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="from-amber-400 to-orange-500">Amber & Orange</option>
                    <option value="from-emerald-400 to-teal-500">Emerald & Teal</option>
                    <option value="from-purple-400 to-pink-500">Purple & Pink</option>
                    <option value="from-blue-400 to-cyan-500">Blue & Cyan</option>
                    <option value="from-yellow-300 via-amber-400 to-yellow-600">Gold Trophy Accent</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPartner?.isSpecial ?? false}
                    onChange={(e) =>
                      setEditingPartner(
                        editingPartner ? { ...editingPartner, isSpecial: e.target.checked } : null
                      )
                    }
                    className="rounded bg-slate-50 border-slate-200 text-yellow-500"
                  />
                  <span className="text-yellow-400 font-semibold">Special Gold Trophy Partner</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPartner?.active ?? true}
                    onChange={(e) =>
                      setEditingPartner(
                        editingPartner ? { ...editingPartner, active: e.target.checked } : null
                      )
                    }
                    className="rounded bg-slate-50 border-slate-200 text-purple-500"
                  />
                  <span className="text-slate-600 font-semibold">Visible on Live Ticker</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setEditingPartner(null);
                  setIsAddingPartner(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingPartner || !editingPartner.name.trim()) {
                    return;
                  }
                  if (isAddingPartner) {
                    addPartner(editingPartner);
                  } else {
                    updatePartner(editingPartner.id, editingPartner);
                  }
                  setEditingPartner(null);
                  setIsAddingPartner(false);
                  showNotification();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold"
              >
                Save Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD REVIEW */}
      {(editingReview || isAddingReview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white/90 border border-emerald-500/30 p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isAddingReview ? 'Add Customer Review' : `Edit Review: ${editingReview?.name}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure client testimonial, stars, role & avatar</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingReview(null);
                  setIsAddingReview(false);
                }}
                className="p-1 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Customer / Reviewer Name</label>
                  <input
                    type="text"
                    value={editingReview?.name || ''}
                    onChange={(e) =>
                      setEditingReview(editingReview ? { ...editingReview, name: e.target.value } : null)
                    }
                    placeholder="e.g. Sarith Basnayake"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Role / Subtitle</label>
                  <input
                    type="text"
                    value={editingReview?.role || ''}
                    onChange={(e) =>
                      setEditingReview(editingReview ? { ...editingReview, role: e.target.value } : null)
                    }
                    placeholder="e.g. Minecraft Server Owner"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Server / Node Type</label>
                  <input
                    type="text"
                    value={editingReview?.serverType || ''}
                    onChange={(e) =>
                      setEditingReview(editingReview ? { ...editingReview, serverType: e.target.value } : null)
                    }
                    placeholder="e.g. PaperMC 1.20.4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Star Rating (1-5)</label>
                  <select
                    value={editingReview?.rating || 5}
                    onChange={(e) =>
                      setEditingReview(
                        editingReview ? { ...editingReview, rating: Number(e.target.value) } : null
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="5">★★★★★ (5.0 Stars)</option>
                    <option value="4">★★★★☆ (4.0 Stars)</option>
                    <option value="3">★★★☆☆ (3.0 Stars)</option>
                    <option value="2">★★☆☆☆ (2.0 Stars)</option>
                    <option value="1">★☆☆☆☆ (1.0 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Review Quote / Testimonial Text</label>
                <textarea
                  rows={3}
                  value={editingReview?.reviewText || ''}
                  onChange={(e) =>
                    setEditingReview(editingReview ? { ...editingReview, reviewText: e.target.value } : null)
                  }
                  placeholder="Write the customer's feedback and experience with HelzerX..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Avatar Photo URL (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingReview?.avatarImage || ''}
                    onChange={(e) =>
                      setEditingReview(editingReview ? { ...editingReview, avatarImage: e.target.value } : null)
                    }
                    placeholder="https://.../photo.jpg or upload"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono"
                  />
                  <label className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            if (editingReview && uploadEvent.target?.result) {
                              setEditingReview({
                                ...editingReview,
                                avatarImage: uploadEvent.target.result as string,
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview?.verified ?? true}
                    onChange={(e) =>
                      setEditingReview(
                        editingReview ? { ...editingReview, verified: e.target.checked } : null
                      )
                    }
                    className="rounded bg-slate-50 border-slate-200 text-emerald-500"
                  />
                  <span className="text-[#00b67a] font-semibold">Verified Client Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview?.active ?? true}
                    onChange={(e) =>
                      setEditingReview(
                        editingReview ? { ...editingReview, active: e.target.checked } : null
                      )
                    }
                    className="rounded bg-slate-50 border-slate-200 text-emerald-500"
                  />
                  <span className="text-slate-600 font-semibold">Show on Website Review Bar</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setIsAddingReview(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingReview || !editingReview.name.trim()) {
                    return;
                  }
                  if (isAddingReview) {
                    addReview(editingReview);
                  } else {
                    updateReview(editingReview.id, editingReview);
                  }
                  setEditingReview(null);
                  setIsAddingReview(false);
                  showNotification();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
