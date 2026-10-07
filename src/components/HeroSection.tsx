import React, { useMemo, useState } from 'react';
import {
  ArrowRight, CheckCircle2, Cpu, Database, Globe2, HardDrive, MapPin, Play,
  Server, ShieldCheck, Sparkles, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThreeDCard } from './ThreeDCard';

export const HeroSection: React.FC = () => {
  const { navigateTo, setIsAuthModalOpen, setAuthModalTab, plans, locations, deployedServers, formatPrice, siteSettings } = useApp();
  const [emailInput, setEmailInput] = useState('');

  const activePlans = useMemo(() => (plans || []).filter((plan) => plan.status !== 'inactive'), [plans]);
  const featuredPlan = activePlans.find((plan) => plan.featured || plan.popular) || activePlans[0] || null;
  const onlineLocations = useMemo(() => (locations || []).filter((location) => location.status !== 'maintenance'), [locations]);
  const runningServers = useMemo(() => (deployedServers || []).filter((server) => server.status === 'running'), [deployedServers]);

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      return;
    }
    navigateTo('plans');
  };

  return (
    <section className="relative isolate overflow-hidden bg-white text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute left-[-140px] top-[42%] h-[460px] w-[460px] rounded-full bg-violet-200/55 blur-3xl" />
        <div className="absolute right-[-160px] top-[48%] h-[500px] w-[500px] rounded-full bg-blue-200/55 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[360px] bg-gradient-to-b from-transparent via-violet-100/35 to-violet-200/65" />
        <div className="absolute inset-0 opacity-[0.28]" style={{
          backgroundImage: 'linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 68%)',
        }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
        <div className="mb-7 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{siteSettings.heroBadgeText || 'Cloud hosting built for performance'}</span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-display text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[76px]">
            {siteSettings.heroTitleLine1 || 'Power your projects'}
            <br />
            {siteSettings.heroTitleLine2 || 'with'}{' '}
            <span className="relative inline-flex align-middle">
              <span className="absolute inset-0 rounded-2xl bg-violet-200/70 blur-xl" />
              <span className="relative inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2 text-white shadow-[0_16px_45px_rgba(99,102,241,0.25)] sm:px-6 sm:py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-indigo-600 shadow-sm sm:h-10 sm:w-10">
                  <Server className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="font-display font-bold tracking-[-0.04em]">{siteSettings.brandName || 'HelzerX'}</span>
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
            {siteSettings.heroSubtitle || 'Fast, reliable game hosting, cloud VPS and dedicated infrastructure for developers, creators and gaming communities.'}
          </p>

          <form onSubmit={handleGetStarted} className="mx-auto mt-8 flex max-w-[520px] items-center rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl transition-all focus-within:border-violet-300 focus-within:shadow-[0_20px_55px_rgba(99,102,241,0.16)]">
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Your email or server domain..."
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0">
              <Play className="h-3 w-3 fill-current" />
              {siteSettings.heroCtaText || 'Get Started'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{activePlans.length > 0 ? '${activePlans.length hosting plans' : 'Flexible hosting plans'}</span>
            <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-blue-500" />{onlineLocations.length > 0 ? '${onlineLocations.length configured locations' : 'Multiple hosting locations'}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-violet-500" />Secure client area</span>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl sm:mt-20">
          <div className="grid items-center gap-5 lg:grid-cols-[0.82fr_1.35fr_0.82fr]">
            <ThreeDCard maxTilt={7} glare={true} className="order-2 rounded-[26px] border border-white bg-white p-5 text-slate-800 shadow-[0_25px_65px_rgba(15,23,42,0.14)] lg:order-1">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-700">{featuredPlan?.badge || featuredPlan?.tier || 'Hosting Plan'}</span>
                  <span className="text-[10px] font-bold text-slate-400">PLAN</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Featured hosting</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <h2 className="font-display text-xl font-bold tracking-tight text-slate-950">{featuredPlan?.name || 'Choose a plan'}</h2>
                  {featuredPlan && <div className="shrink-0 text-right"><span className="font-display text-2xl font-bold text-slate-950">{formatPrice(featuredPlan.monthlyPrice)}</span><span className="text-[10px] text-slate-400">/mo</span></div>}
                </div>
                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-violet-600" />CPU</span><span className="text-right font-bold text-slate-900">{featuredPlan?.cpu || 'Configured per plan'}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-blue-600" />Memory</span><span className="font-bold text-slate-900">{featuredPlan?.ram || 'Included'}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><HardDrive className="h-3.5 w-3.5 text-cyan-600" />Storage</span><span className="font-bold text-slate-900">{featuredPlan?.storage || 'Included'}</span></div>
                </div>
                <button type="button" onClick={() => navigateTo('plans')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-50 py-3 text-xs font-bold text-violet-700 transition hover:bg-violet-100">
                  View hosting plans <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </ThreeDCard>

            <ThreeDCard maxTilt={9} scale={1.02} glare={true} className="order-1 z-20 rounded-[30px] border border-white/90 bg-white p-4 shadow-[0_35px_90px_rgba(15,23,42,0.18)] sm:p-5 lg:order-2">
              <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-black text-white shadow-md shadow-violet-500/20">HX</div>
                    <div><span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">HelzerX Control</span><span className="block text-xs font-bold text-slate-900">Hosting overview</span></div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{runningServers.length > 0 ? 'Servers running' : 'Ready to deploy'}</span>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-2xl bg-gradient-to-br from-white via-violet-50/70 to-blue-50 p-4">
                    <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{runningServers.length > 0 ? 'Active servers' : 'Your infrastructure'}</span><Server className="h-4 w-4 text-violet-600" /></div>
                    <div className="mt-2 flex items-end gap-2"><span className="font-display text-4xl font-bold tracking-tight text-slate-950">{runningServers.length}</span><span className="pb-1 text-[10px] font-semibold text-slate-400">running</span></div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: runningServers.length > 0 ? '68%' : '8%' }} /></div>
                    <p className="mt-2 text-[9px] font-medium text-slate-400">Live count from your configured hosting data</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80"><MapPin className="h-4 w-4 text-blue-600" /><span className="mt-2 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Locations</span><span className="font-display text-xl font-bold text-slate-950">{onlineLocations.length}</span></div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80"><Zap className="h-4 w-4 text-amber-500" /><span className="mt-2 block text-[9px] font-bold uppercase tracking-wider text-slate-400">Plans</span><span className="font-display text-xl font-bold text-slate-950">{activePlans.length}</span></div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Client area</span><span>•</span><span>{siteSettings.brandName || 'HelzerX'}</span></div>
                  <button type="button" onClick={() => navigateTo('plans')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-slate-800">Deploy a server <ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            </ThreeDCard>

            <ThreeDCard maxTilt={7} glare={true} className="order-3 rounded-[26px] border border-white bg-white p-5 text-slate-800 shadow-[0_25px_65px_rgba(15,23,42,0.14)]">
              <div>
                <div className="mb-4 flex items-center justify-between"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700"><Globe2 className="h-3 w-3" />Infrastructure</span><span className="text-[10px] font-bold text-slate-400">CONFIGURED</span></div>
                <h3 className="font-display text-lg font-bold tracking-tight text-slate-950">Hosting locations</h3>
                <p className="mt-1 text-[10px] font-medium leading-5 text-slate-400">Select a location when you deploy your next server.</p>
                <div className="mt-4 space-y-2">
                  {onlineLocations.slice(0, 3).map((location) => (
                    <button key={location.id} type="button" onClick={() => navigateTo('locations')} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50">
                      <span className="flex min-w-0 items-center gap-2"><span className="text-sm">{location.flag}</span><span className="truncate text-[10px] font-bold text-slate-800">{location.city}</span></span>
                      <span className="shrink-0 text-[9px] font-bold text-emerald-600">{location.pingMs} ms</span>
                    </button>
                  ))}
                  {onlineLocations.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-[10px] font-medium text-slate-400">Locations will appear here when configured.</div>}
                </div>
                <button type="button" onClick={() => navigateTo('locations')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-[10px] font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">Explore locations <ArrowRight className="h-3 w-3" /></button>
              </div>
            </ThreeDCard>
          </div>
          <div className="pointer-events-none absolute -bottom-20 left-1/2 -z-10 h-52 w-[82%] -translate-x-1/2 rounded-full bg-violet-400/30 blur-[70px]" />
        </div>
      </div>
    </section>
  );
};
