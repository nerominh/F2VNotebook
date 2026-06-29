import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserAwarenessScore } from '../types';

const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [awarenessScore, setAwarenessScore] = useState<UserAwarenessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState('user-123'); // TODO: Get from auth context

  useEffect(() => {
    const loadAwarenessScore = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/quizzes/user/${userId}/awareness`);
        if (!response.ok) throw new Error(t('profile.loadError'));
        const data = await response.json();
        setAwarenessScore(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.genericError'));
      } finally {
        setLoading(false);
      }
    };

    loadAwarenessScore();
  }, [userId]);

  const getStatusColor = (status: string | undefined): string => {
    switch (status) {
      case 'good':
        return 'bg-green-500/10 border-green-500 text-green-400';
      case 'needs_improvement':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'restricted':
        return 'bg-red-500/10 border-red-500 text-red-400';
      default:
        return 'bg-gray-500/10 border-gray-500 text-gray-400';
    }
  };

  const getStatusBadge = (status: string | undefined): string => {
    switch (status) {
      case 'good':
        return t('sidebar.badges.good');
      case 'needs_improvement':
        return t('sidebar.badges.needsImprovement');
      case 'restricted':
        return t('sidebar.badges.restricted');
      default:
        return t('sidebar.badges.default');
    }
  };

  const isCertified = awarenessScore?.overall_score === 100;
  const roadmapSteps = [
    { key: 'basics', threshold: 0 },
    { key: 'disease', threshold: 35 },
    { key: 'operations', threshold: 65 },
    { key: 'certification', threshold: 90 },
  ] as const;

  const getRoadmapState = (threshold: number, index: number) => {
    const score = awarenessScore?.overall_score ?? 0;
    const nextThreshold = roadmapSteps[index + 1]?.threshold ?? 101;

    if (score >= nextThreshold || score === 100) return 'completed';
    if (score >= threshold) return 'current';
    return 'locked';
  };

  const getRoadmapClasses = (state: string) => {
    switch (state) {
      case 'completed':
        return {
          card: 'border-emerald-400/40 bg-emerald-500/10',
          marker: 'bg-emerald-500 text-white',
          label: 'text-emerald-300',
        };
      case 'current':
        return {
          card: 'border-sky-400/50 bg-sky-500/10',
          marker: 'bg-sky-500 text-white',
          label: 'text-sky-300',
        };
      default:
        return {
          card: 'border-farm-border bg-farm-panel/70',
          marker: 'bg-farm-muted text-farm-subtle',
          label: 'text-farm-subtle',
        };
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('app.farmerProfile')}</h1>
            <p className="text-gray-400">{t('profile.subtitle')}</p>
          </div>
        </div>

        {loading && (
          <div className="bg-farm-card border border-farm-border rounded-lg p-8 text-center">
            <div className="text-gray-400">{t('profile.loading')}</div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {awarenessScore && !loading && (
          <div className="space-y-6">
            {/* Awareness Score Card */}
            <div className="bg-farm-card border border-farm-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">{t('profile.awarenessScore')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Display */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary-600/10"></div>
                    <div className="relative text-center">
                      <div className="text-6xl font-bold text-primary-400">
                        {awarenessScore.overall_score}
                      </div>
                      <div className="text-gray-400">%</div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">{t('profile.farmerStatus')}</p>
                    <div className={`inline-block px-4 py-2 rounded-full border ${getStatusColor(awarenessScore.status)}`}>
                      {getStatusBadge(awarenessScore.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('profile.quizzesCompleted')}</p>
                      <p className="text-2xl font-bold text-white">{awarenessScore.quizzes_completed}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('profile.quizzesPassed')}</p>
                      <p className="text-2xl font-bold text-green-400">{awarenessScore.quizzes_passed}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm mb-1">{t('profile.lastUpdated')}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(awarenessScore.last_updated).toLocaleDateString(i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="bg-farm-card border border-farm-border rounded-lg p-6">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
                    {t('profile.roadmap.eyebrow')}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{t('profile.roadmap.title')}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-farm-subtle">
                    {t('profile.roadmap.subtitle')}
                  </p>
                </div>
                <div className="rounded-lg border border-primary-400/30 bg-primary-500/10 px-4 py-3 text-sm text-primary-200">
                  <span className="font-semibold">{awarenessScore.overall_score}%</span>
                  <span className="ml-2 text-farm-subtle">{t('profile.roadmap.progressLabel')}</span>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                {roadmapSteps.map((step, index) => {
                  const state = getRoadmapState(step.threshold, index);
                  const classes = getRoadmapClasses(state);

                  return (
                    <div
                      key={step.key}
                      className={`rounded-lg border p-4 transition-colors ${classes.card}`}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${classes.marker}`}>
                          {index + 1}
                        </div>
                        <span className={`text-xs font-semibold uppercase ${classes.label}`}>
                          {t(`profile.roadmap.status.${state}`)}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white">
                        {t(`profile.roadmap.steps.${step.key}.title`)}
                      </h3>
                      <p className="mt-2 text-sm text-farm-subtle">
                        {t(`profile.roadmap.steps.${step.key}.description`)}
                      </p>
                      <div className="mt-4 rounded-md bg-black/10 px-3 py-2 text-xs text-farm-muted dark:bg-white/5">
                        {t('profile.roadmap.unlockAt', { score: step.threshold })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certificate Section */}
            {isCertified && (
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🏆</span>
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-300">{t('profile.congratulations')}</h2>
                    <p className="text-gray-300">{t('profile.perfectScore')}</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-6">
                  <img
                    src="/images/certificate.png"
                    alt={t('profile.certificateAlt')}
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-300 mb-4">
                    {t('profile.certificateDescription')}
                  </p>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    {t('profile.downloadCertificate')}
                  </button>
                </div>
              </div>
            )}

            {!isCertified && (
              <div className="bg-farm-card border border-farm-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📚</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{t('profile.keepLearning')}</h3>
                    <p className="text-gray-400">
                      {t('profile.keepLearningMessage', {
                        score: awarenessScore.overall_score,
                        remaining: 100 - awarenessScore.overall_score,
                      })}
                    </p>
                    <button className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {t('profile.takeMoreQuizzes')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
