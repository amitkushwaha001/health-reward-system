import React, { useEffect, useState } from 'react';
import { aiService, recommendationService, userService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import './AIExperience.css';

export const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    aiService.getInsights()
      .then((response) => { if (active) setInsights(response.data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Personal insights could not be loaded.'); });
    return () => { active = false; };
  }, [retry]);

  return (
    <section className="ai-insights-section" aria-labelledby="ai-insights-title">
      <div className="ai-section-heading">
        <div>
          <p className="section-eyebrow">PERSONALIZED FROM YOUR RECORDS</p>
          <h2 id="ai-insights-title">AI insights</h2>
        </div>
        {error && <button className="text-button" type="button" onClick={() => { setError(''); setRetry((value) => value + 1); }}>Try again</button>}
      </div>
      {error ? <p className="ai-error" role="alert">{error}</p> : !insights ? (
        <div className="ai-insights-loading" role="status">Preparing your private insights…</div>
      ) : (
        <>
          <div className="ai-insights-grid">
            <article className="ai-insight-card">
              <span className="ai-insight-icon" aria-hidden="true">◎</span>
              <h3>Today's activity</h3>
              <p>{insights.today.steps === null ? 'No step entry recorded for today.' : `${insights.today.steps.toLocaleString()} steps recorded today.`}</p>
              {insights.dailyStepGoal && <small>Your selected target: {insights.dailyStepGoal.toLocaleString()} steps{insights.today.goalProgressPercent !== null ? ` · ${insights.today.goalProgressPercent}% of target` : ''}</small>}
            </article>
            <article className="ai-insight-card">
              <span className="ai-insight-icon" aria-hidden="true">↗</span>
              <h3>Weekly activity plan</h3>
              <p>{insights.weeklyPlan ? `Consider choosing ${insights.weeklyPlan.days} days that fit your schedule.` : 'Log a few activities to unlock a personal planning summary.'}</p>
              {insights.weeklyPlan && <small>{insights.weeklyPlan.suggestedStepsPerActiveDay.toLocaleString()} steps per recorded day recently; no schedule is changed.</small>}
            </article>
            <article className="ai-insight-card">
              <span className="ai-insight-icon" aria-hidden="true">≈</span>
              <h3>Progress projection</h3>
              <p>{insights.progressProjection ? `${insights.progressProjection.projectedWeeklySteps.toLocaleString()} steps over 7 days at your recent logged-day average.` : 'Not enough recorded activity for a projection.'}</p>
              <small>{insights.progressProjection?.basis || 'This view uses only your own records.'}</small>
            </article>
          </div>
          <p className="ai-disclaimer">{insights.disclaimer}</p>
        </>
      )}
    </section>
  );
};

export const RecommendedForYou = () => {
  const { updateUser } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    let active = true;
    recommendationService.generate()
      .then((response) => { if (active) setRecommendations(response.data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Recommendations could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (recommendation, status) => {
    setError('');
    try {
      const response = await recommendationService.updateStatus(recommendation._id, status);
      setRecommendations((current) => current.map((item) => item._id === recommendation._id ? response.data.data : item));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Recommendation could not be updated.');
    }
  };

  const setSuggestedGoal = async (recommendation) => {
    const confirmed = window.confirm(`Set your personal daily step goal to ${recommendation.targetStepGoal.toLocaleString()} steps?`);
    if (!confirmed) return;
    setError('');
    try {
      const response = await userService.updateProfile({ dailyStepGoal: recommendation.targetStepGoal });
      updateUser(response.data.data);
      await updateStatus(recommendation, 'completed');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Goal could not be saved.');
    }
  };

  const toggleHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      setError('');
      try {
        const response = await recommendationService.getToday();
        setRecommendations(response.data.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Today’s recommendations could not be loaded.');
      }
      return;
    }
    setHistoryOpen(true);
    setError('');
    try {
      const response = await recommendationService.getHistory({ limit: 20 });
      setRecommendations(response.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Recommendation history could not be loaded.');
    }
  };

  return (
    <section className="recommendations-section" aria-labelledby="recommendations-title">
      <div className="ai-section-heading">
        <div>
          <p className="section-eyebrow">BASED ON YOUR ACTIVITY AND CHOICES</p>
          <h2 id="recommendations-title">Recommended for you</h2>
        </div>
        <button type="button" className="text-button" onClick={toggleHistory}>{historyOpen ? 'Today' : 'History'}</button>
      </div>
      {error && <p className="ai-error" role="alert">{error}</p>}
      {loading ? <div className="ai-insights-loading" role="status">Finding recommendations from your records…</div> : (
        <div className="recommendation-list">
          {recommendations.length ? recommendations.map((recommendation) => (
            <article className="recommendation-card" key={recommendation._id}>
              <div className="recommendation-topline">
                <span className={`priority-badge priority-${recommendation.priority}`}>{recommendation.priority} priority</span>
                <span className={`recommendation-status status-${recommendation.status}`}>{recommendation.status}</span>
              </div>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.explanation}</p>
              <p className="recommendation-benefit"><strong>Why it may help:</strong> {recommendation.expectedBenefit}</p>
              <p className="recommendation-action"><strong>Suggested action:</strong> {recommendation.suggestedAction}</p>
              <div className="recommendation-actions">
                {recommendation.status === 'pending' && (
                  <>
                    <button type="button" className="btn btn-primary" onClick={() => updateStatus(recommendation, 'accepted')}>Accept</button>
                    <button type="button" className="btn btn-outline" onClick={() => updateStatus(recommendation, 'dismissed')}>Dismiss</button>
                  </>
                )}
                {recommendation.status === 'accepted' && (
                  <>
                    {recommendation.targetStepGoal && <button type="button" className="btn btn-primary" onClick={() => setSuggestedGoal(recommendation)}>Set this goal</button>}
                    <button type="button" className="btn btn-outline" onClick={() => updateStatus(recommendation, 'completed')}>Mark complete</button>
                    <button type="button" className="btn btn-outline" onClick={() => updateStatus(recommendation, 'dismissed')}>Dismiss</button>
                  </>
                )}
              </div>
            </article>
          )) : <p className="ai-empty">No recommendation history is available yet.</p>}
        </div>
      )}
    </section>
  );
};

const suggestedQuestions = [
  'Summarize my recent progress',
  'Explain the calorie estimate',
  'How do my points work?',
];

export const AssistantPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    aiService.getChatHistory()
      .then((response) => { if (active) setMessages(response.data.data); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Conversation history could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const send = async (event, suggestedMessage) => {
    if (event) event.preventDefault();
    const text = (suggestedMessage || input).trim();
    if (!text || sending) return;
    setError('');
    setMessages((current) => [...current, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    try {
      const response = await aiService.sendMessage(text);
      setMessages((current) => [...current, response.data.data.messages[1]]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The assistant could not respond. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className={`assistant-panel${expanded ? ' assistant-expanded' : ' assistant-collapsed'}`} aria-labelledby="assistant-title">
      <div className="assistant-heading">
        <div className="assistant-avatar" aria-hidden="true">✦</div>
        <div>
          <p className="section-eyebrow">PRIVATE ACTIVITY GUIDE</p>
          <h2 id="assistant-title">Health assistant</h2>
        </div>
        <button type="button" className="assistant-toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Collapse' : 'Open'}
        </button>
      </div>
      {expanded && (
        <>
          <p className="assistant-intro">Ask about your charts, goals, weekly ideas, or rewards. Answers use your account records only.</p>
          {error && <p className="ai-error" role="alert">{error}</p>}
          <div className="assistant-messages" role="log" aria-live="polite" aria-label="Assistant conversation">
            {loading ? <p className="assistant-placeholder">Loading your conversation…</p> : messages.length ? messages.map((message, index) => (
              <div className={`assistant-message message-${message.role}`} key={`${message.createdAt || 'new'}-${index}`}>
                <span>{message.content}</span>
              </div>
            )) : <p className="assistant-placeholder">Hi! I can summarize recent activity, explain estimates, or help you review rewards.</p>}
            {sending && <div className="assistant-typing" role="status"><span /> <span /> <span /> Assistant is thinking</div>}
          </div>
          <div className="assistant-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((question) => (
              <button type="button" key={question} onClick={() => send(null, question)} disabled={sending}>{question}</button>
            ))}
          </div>
          <form className="assistant-form" onSubmit={(event) => send(event)}>
            <label className="visually-hidden" htmlFor="assistant-message">Message the health assistant</label>
            <textarea id="assistant-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} rows="2" placeholder="Ask a question…" />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>Send</button>
          </form>
          <p className="assistant-disclaimer">Not medical advice. Estimates are not measured values. The assistant never changes goals or redeems rewards.</p>
        </>
      )}
    </aside>
  );
};
