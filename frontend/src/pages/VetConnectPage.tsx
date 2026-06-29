import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VetPanel from '../components/consult/VetPanel';
import { fetchVets, submitConsultRequest } from '../services/farm2vets';
import type { ConsultPriority, Vet } from '../types';

const statusClasses: Record<string, string> = {
  online: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  busy: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  offline: 'border-farm-border bg-farm-panel text-farm-subtle',
};

interface VetConnectPageProps {
  requestRef?: React.RefObject<HTMLFormElement | null>;
  availabilityRef?: React.RefObject<HTMLElement | null>;
  queueRef?: React.RefObject<HTMLElement | null>;
}

const VetConnectPage: React.FC<VetConnectPageProps> = ({
  requestRef,
  availabilityRef,
  queueRef,
}) => {
  const { t } = useTranslation();
  const [vets, setVets] = useState<Vet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [animalType, setAnimalType] = useState('swine');
  const [urgency, setUrgency] = useState<ConsultPriority>('normal');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const loadVets = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const data = await fetchVets();
        setVets(data);
      } catch (error) {
        console.error('Failed to load vets:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadVets();
  }, []);

  const availableVets = vets.filter((vet) => vet.status === 'online');
  const todayVets = vets.filter((vet) => vet.status !== 'offline');
  const featuredVets = vets.length > 0 ? vets : [];
  const consultQueue = ['biosecurity', 'vaccination', 'symptoms'];

  const handleSubmitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setRequestSent(false);

    try {
      await submitConsultRequest({
        farmer_id: 'user-001',
        subject: t('vetConnect.requestSubject', {
          animal: t(`vetConnect.animals.${animalType}`),
        }),
        description: symptoms.trim() || t('vetConnect.defaultRequestDescription'),
        priority: urgency,
      });
      setRequestSent(true);
      setSymptoms('');
    } catch (error) {
      console.error('Failed to submit consult request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto p-6 text-left">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
              {t('vetConnect.eyebrow')}
            </p>
            <h1 className="text-left text-3xl font-bold text-white">{t('vetConnect.title')}</h1>
            <p className="max-w-2xl text-sm text-farm-subtle">{t('vetConnect.subtitle')}</p>
          </div>
          <div className="rounded-lg border border-primary-400/30 bg-primary-500/10 px-4 py-3 text-sm text-primary-200">
            <span className="font-semibold">{t('vetConnect.responseTimeValue')}</span>
            <span className="ml-2 text-farm-subtle">{t('vetConnect.responseTimeLabel')}</span>
          </div>
        </div>

        {hasError && (
          <div className="rounded-lg border border-red-700 bg-red-950/40 p-4 text-sm text-red-300">
            {t('vetConnect.loadError')}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t('vetConnect.metrics.available'), value: availableVets.length, tone: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/30' },
            { label: t('vetConnect.metrics.today'), value: todayVets.length, tone: 'from-sky-500/20 to-cyan-500/10 border-sky-400/30' },
            { label: t('vetConnect.metrics.urgent'), value: 2, tone: 'from-rose-500/20 to-orange-500/10 border-rose-400/30' },
            { label: t('vetConnect.metrics.region'), value: t('vetConnect.metrics.regionValue'), tone: 'from-violet-500/20 to-fuchsia-500/10 border-violet-400/30' },
          ].map((metric) => (
            <div key={metric.label} className={`rounded-lg border bg-gradient-to-br ${metric.tone} p-4`}>
              <p className="text-sm text-farm-subtle">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="space-y-6">
            <form ref={requestRef} onSubmit={handleSubmitRequest} className="card space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-300">
                  {t('vetConnect.requestComposer.eyebrow')}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{t('vetConnect.requestComposer.title')}</h2>
                <p className="mt-1 text-sm text-farm-subtle">{t('vetConnect.requestComposer.subtitle')}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-farm-text">{t('vetConnect.requestComposer.animalType')}</span>
                  <select
                    value={animalType}
                    onChange={(event) => setAnimalType(event.target.value)}
                    className="w-full rounded-lg border border-farm-border bg-farm-panel px-3 py-2 text-farm-text outline-none focus:border-primary-400 dark:bg-slate-900 dark:text-white"
                  >
                    {['swine', 'cattle', 'poultry', 'goat'].map((animal) => (
                      <option key={animal} value={animal} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {t(`vetConnect.animals.${animal}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-farm-text">{t('vetConnect.requestComposer.urgency')}</span>
                  <select
                    value={urgency}
                    onChange={(event) => setUrgency(event.target.value as ConsultPriority)}
                    className="w-full rounded-lg border border-farm-border bg-farm-panel px-3 py-2 text-farm-text outline-none focus:border-primary-400 dark:bg-slate-900 dark:text-white"
                  >
                    {['low', 'normal', 'high', 'emergency'].map((priority) => (
                      <option key={priority} value={priority} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {t(`vetConnect.priority.${priority}`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-farm-text">{t('vetConnect.requestComposer.symptoms')}</span>
                <textarea
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  rows={4}
                  placeholder={t('vetConnect.requestComposer.symptomsPlaceholder')}
                  className="w-full resize-none rounded-lg border border-farm-border bg-farm-panel px-3 py-2 text-farm-text outline-none placeholder:text-farm-muted focus:border-primary-400 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
                />
              </label>

              <div className="flex flex-col gap-3 border-t border-farm-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-farm-subtle">{t('vetConnect.requestComposer.photoHint')}</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
                >
                  {requestSent ? t('vetConnect.consultRequested') : submitting ? t('vetConnect.sending') : t('vetConnect.requestComposer.submit')}
                </button>
              </div>
            </form>

            <section ref={availabilityRef} className="card space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('vetConnect.availableTitle')}</h2>
                  <p className="text-sm text-farm-subtle">{t('vetConnect.availableSubtitle')}</p>
                </div>
                <span className="rounded-full border border-farm-border px-3 py-1 text-xs text-farm-subtle">
                  {t('vetConnect.groupedByAvailability')}
                </span>
              </div>

              {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-lg bg-farm-border/50" />
                  ))}
                </div>
              ) : featuredVets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-farm-border bg-farm-panel/60 p-6 text-center">
                  <p className="text-base font-semibold text-white">{t('vetConnect.emptyState.title')}</p>
                  <p className="mt-2 text-sm text-farm-subtle">{t('vetConnect.emptyState.description')}</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {featuredVets.map((vet, index) => (
                    <article key={vet.id} className="rounded-lg border border-farm-border bg-farm-panel/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-700/40 text-sm font-bold text-primary-100">
                            {vet.full_name.split(' ').slice(-2).map((n) => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">{vet.full_name}</h3>
                            <p className="truncate text-xs text-farm-subtle">{vet.specialty}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[vet.status] ?? statusClasses.offline}`}>
                          {t(`vetConnect.status.${vet.status}`)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-md bg-black/10 p-2 dark:bg-white/5">
                          <p className="text-farm-muted">{t('vetConnect.card.region')}</p>
                          <p className="mt-1 font-medium text-farm-text">{t(`vetConnect.demoRegions.${index % 3}`)}</p>
                        </div>
                        <div className="rounded-md bg-black/10 p-2 dark:bg-white/5">
                          <p className="text-farm-muted">{t('vetConnect.card.response')}</p>
                          <p className="mt-1 font-medium text-farm-text">{t(`vetConnect.demoResponse.${vet.status}`)}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <VetPanel vets={vets} isLoading={isLoading} />

            <section ref={queueRef} className="card space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{t('vetConnect.queue.title')}</h2>
                <p className="text-sm text-farm-subtle">{t('vetConnect.queue.subtitle')}</p>
              </div>
              <div className="space-y-3">
                {consultQueue.map((item) => (
                  <div key={item} className="rounded-lg border border-farm-border bg-farm-panel/70 p-3">
                    <p className="text-sm font-medium text-white">{t(`vetConnect.queue.items.${item}.title`)}</p>
                    <p className="mt-1 text-xs text-farm-subtle">{t(`vetConnect.queue.items.${item}.description`)}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VetConnectPage;
