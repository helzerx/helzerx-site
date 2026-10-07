import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  MapPin,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThreeDCard } from './ThreeDCard';

export const HeroSection: React.FC = () => {
  const {
    navigateTo,
    setIsAuthModalOpen,
    setAuthModalTab,
    plans,
    locations,
    deployedServers,
    formatPrice,
    siteSettings,
  } = useApp();

  const [emailInput, setEmailInput] = useState('');

  const activePlans = useMemo(
    () => (plans || []).filter((plan) => plan.status !== 'inactive'),
    [plans]
  );

  const featuredPlan =
    activePlans.find((plan) => plan.featured || plan.popular) ||
    activePlans[0] ||
    null;

  const onlineLocations = useMemo(
    () => (locations || []).filter((location) => location.status !== 'maintenance'),
    [locations]
  );

  const runningServers = useMemo(
    () => (deployedServers || []).filter((server) => server.status === 'running'),
    [deployedServers]
  );

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
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#fcfcff] text-slate-950 sm:min-h-[900px]">
      {/* Reference-inspired soft SaaS atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[280px] h-[620px] w-[1000px] -translate-x-1/2 rounded-full bg-violet-200/55 blur-[110px]" />
        <div className="absolute left-[-170px] top-[500px] h-[520px] w-[520px] rounded-full bg-purple-300/45 blur-[100px]" />
        <div className="absolute right-[-180px] top-[480px] h-[540px] w-[540px] rounded-full bg-blue-200/55 blur-[105px]" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-b from-transparent via-violet-100/55 to-violet-200/80" />
        <div
          className="absolute inset-x-0 top-[130px] h-[520px] opacity-[0.22]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.25) 1px, transparent 0)',
            backgroundSize: '34px 34px',
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, transparent 95%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-0 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Small reference-style eyebrow */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 sm:text-sm">
            <Cloud className="h-4 w-4" />
            <span>{siteSettings.heroBadgeText || 'Next-generation cloud hosting'}</span>
          </div>
        </div>

        {/* Main reference-style headline */}
        <div className="mx-auto mt-5 max-w-5xl text-center">
          <h1 className="font-display text-[43px] font-medium leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[78px]">
            {siteSettings.heroTitleLine1 || 'Power your cloud'}
            <br />
            {siteSettings.heroTitleLine2 || 'with'}{' '}
            <span className="relative inline-block">
              <span className="absolute inset-0 rounded-[18px] bg-violet-300/60 blur-2xl" />
              <span className="relative inline-flex items-center rounded-[18px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 px-4 py-2 text-white shadow-[0_14px_40px_rgba(124,58,237,0.28)] sm:px-6 sm:py-2.5">
                <span className="font-display font-medium tracking-[-0.055em]">
                  {siteSettings.brandName || 'HelzerX'}
                </span>
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[690px] text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            {siteSettings.heroSubtitle ||
              'Simplify your cloud infrastructure with fast game servers, VPS hosting and scalable compute — built for developers, creators and growing communities.'}
          </p>

          <form
            onSubmit={handleGetStarted}
            className="mx-auto mt-7 flex max-w-[500px] items-center rounded-full border border-slate-200/90 bg-white/90 p-1.5 shadow-[0_14px_45px_rgba(30,27,75,0.10)] backdrop-blur-xl focus-within:border-violet-300 focus-within:shadow-[0_18px_50px_rgba(124,58,237,0.14)]"
          >
            <input
              type="text"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Your email or server domain..."
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <Play className="h-3 w-3 fill-current" />
              {siteSettings.heroCtaText || 'Get Started'}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-semibold text-slate-400 sm:text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Fast deployment
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-500" />
              Secure cloud infrastructure
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Built for developers
            </span>
          </div>
        </div>

        {/* Phone + floating cards, following the reference composition */}
        <div className="relative mx-auto mt-10 h-[430px] max-w-6xl sm:mt-14 sm:h-[570px]">
          {/* soft light behind the product */}
          <div className="absolute left-1/2 top-[160px] h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-violet-400/35 blur-[95px] sm:top-[220px] sm:h-[430px] sm:w-[720px]" />

          {/* Left floating cloud card */}
          <ThreeDCard
            maxTilt={5}
            glare={true}
            className="absolute left-[1%] top-[120px] z-20 hidden w-[245px] rounded-[22px] border border-white/90 bg-white/95 p-4 shadow-[0_25px_70px_rgba(38,28,80,0.16)] backdrop-blur-xl sm:block lg:left-[5%] lg:top-[170px]"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Server className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Infrastructure
                </p>
                <p className="text-xs font-bold text-slate-900">Cloud Servers</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold text-slate-400">Running servers</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-2xl font-bold text-slate-950">
                  {runningServers.length}
                </span>
                <span className="pb-0.5 text-[9px] font-semibold text-slate-400">active</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[9px] font-semibold">
              <span className="text-slate-400">Plans available</span>
              <span className="text-violet-600">{activePlans.length}</span>
            </div>
          </ThreeDCard>

          {/* Right floating cloud card */}
          <ThreeDCard
            maxTilt={5}
            glare={true}
            className="absolute right-[1%] top-[95px] z-20 hidden w-[250px] rounded-[22px] border border-white/90 bg-white/95 p-4 shadow-[0_25px_70px_rgba(38,28,80,0.16)] backdrop-blur-xl sm:block lg:right-[5%] lg:top-[145px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Global cloud
                  </p>
                  <p className="text-xs font-bold text-slate-900">Locations</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-600">
                Ready
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {onlineLocations.slice(0, 2).map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => navigateTo('locations')}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-left transition hover:bg-violet-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span>{location.flag}</span>
                    <span className="truncate text-[9px] font-bold text-slate-700">
                      {location.city}
                    </span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600">
                    {location.pingMs}ms
                  </span>
                </button>
              ))}

              {onlineLocations.length === 0 && (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-center text-[9px] text-slate-400">
                  Configure a location to show it here.
                </div>
              )}
            </div>
          </ThreeDCard>

          {/* Center phone */}
          <div className="absolute left-1/2 top-[40px] z-10 w-[260px] -translate-x-1/2 sm:top-[55px] sm:w-[350px]">
            <div className="absolute inset-x-[-45px] top-[90px] h-[370px] rounded-[50%] bg-white/60 blur-3xl" />

            <div className="relative rounded-[42px] border-[7px] border-slate-950 bg-slate-950 p-1.5 shadow-[0_35px_90px_rgba(37,24,75,0.30)] sm:rounded-[50px] sm:border-[8px]">
              <div className="relative overflow-hidden rounded-[34px] bg-[#fbfaff] sm:rounded-[42px]">
                <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950 sm:h-7 sm:w-28" />

                <div className="px-4 pb-8 pt-10 sm:px-5 sm:pb-10 sm:pt-11">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-semibold text-slate-400">HELZERX CLOUD</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-950 sm:text-base">Your infrastructure</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                      <Cloud className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-4 text-white shadow-[0_18px_35px_rgba(124,58,237,0.25)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-semibold text-white/70">CLOUD HOSTING</span>
                      <span className="rounded-full bg-white/15 px-2 py-1 text-[7px] font-bold">
                        {runningServers.length > 0 ? 'ACTIVE' : 'READY'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[8px] text-white/65">Running servers</p>
                        <p className="font-display text-3xl font-bold">{runningServers.length}</p>
                      </div>
                      <Server className="h-7 w-7 text-white/80" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                      <Globe2 className="h-4 w-4 text-violet-500" />
                      <p className="mt-2 text-[7px] font-bold uppercase tracking-wider text-slate-400">
                        Locations
                      </p>
                      <p className="mt-0.5 font-display text-lg font-bold text-slate-950">
                        {onlineLocations.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <p className="mt-2 text-[7px] font-bold uppercase tracking-wider text-slate-400">
                        Plans
                      </p>
                      <p className="mt-0.5 font-display text-lg font-bold text-slate-950">
                        {activePlans.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-slate-500">Featured plan</span>
                      <span className="text-[8px] font-bold text-violet-600">
                        {featuredPlan?.name || 'Configure a plan'}
                      </span>
                    </div>
                    {featuredPlan && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[8px] text-slate-500">
                          <Cpu className="h-3 w-3 text-violet-500" />
                          {featuredPlan.cpu}
                        </span>
                        <span className="flex items-center gap-1.5 text-[8px] text-slate-500">
                          <Database className="h-3 w-3 text-blue-500" />
                          {featuredPlan.ram}
                        </span>
                        <span className="flex items-center gap-1.5 text-[8px] text-slate-500">
                          <HardDrive className="h-3 w-3 text-cyan-500" />
                          {featuredPlan.storage}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('plans')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-[9px] font-bold text-white"
                  >
                    Deploy a server
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom floating card */}
          <ThreeDCard
            maxTilt={4}
            glare={true}
            className="absolute bottom-[18px] left-1/2 z-30 hidden w-[430px] -translate-x-1/2 rounded-[22px] border border-white/90 bg-white/95 p-3.5 shadow-[0_25px_70px_rgba(38,28,80,0.18)] backdrop-blur-xl sm:block"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Cloud deployment
                  </p>
                  <p className="truncate text-xs font-bold text-slate-900">
                    {featuredPlan?.name || 'Choose your hosting plan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('plans')}
                className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-[9px] font-bold text-white shadow-md shadow-violet-500/20"
              >
                View plans
              </button>
            </div>
          </ThreeDCard>
        </div>

        {/* Mobile-friendly compact information row */}
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 pb-12 sm:hidden">
          <div className="rounded-2xl border border-white/90 bg-white/85 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-violet-600">
              <MapPin className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Locations</span>
            </div>
            <p className="mt-1 font-display text-xl font-bold">{onlineLocations.length}</p>
          </div>
          <div className="rounded-2xl border border-white/90 bg-white/85 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-violet-600">
              <Server className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Servers</span>
            </div>
            <p className="mt-1 font-display text-xl font-bold">{runningServers.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
