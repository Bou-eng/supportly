import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import './KnowledgeBase.css';

const MOCK_CATEGORIES = [
  { id: 'all', name: 'All Categories', count: 12 },
  { id: 'getting-started', name: 'Getting Started', count: 4 },
  { id: 'dns-domains', name: 'Domain & DNS', count: 3 },
  { id: 'account-billing', name: 'Account & Billing', count: 3 },
  { id: 'api-webhooks', name: 'API & Webhooks', count: 2 },
];

const MOCK_ARTICLES = [
  {
    id: 'kb-101',
    category: 'dns-domains',
    title: 'How to configure custom CNAME records for your workspace',
    snippet: 'Learn how to point your custom domain DNS records to Supportly servers with zero downtime.',
    views: 1420,
    updated: '2 days ago'
  },
  {
    id: 'kb-102',
    category: 'getting-started',
    title: 'Quickstart guide for support team onboarding',
    snippet: 'Set up your agent profile, default signatures, notifications, and ticket assignment preferences.',
    views: 890,
    updated: '1 week ago'
  },
  {
    id: 'kb-103',
    category: 'account-billing',
    title: 'Managing workspace seat limits and enterprise billing',
    snippet: 'Understand how billing cycles work when adding or removing support agents mid-month.',
    views: 650,
    updated: '3 weeks ago'
  },
  {
    id: 'kb-104',
    category: 'api-webhooks',
    title: 'Authenticating REST API requests with Bearer tokens',
    snippet: 'Generate secret keys and sign webhook payloads securely in your custom integrations.',
    views: 1100,
    updated: '5 days ago'
  }
];

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateArticle = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setValidationError('kb.modal.titleRequired');
      return;
    }
    if (!newCategory) {
      setValidationError('kb.modal.categoryRequired');
      return;
    }
    if (!newContent.trim()) {
      setValidationError('kb.modal.contentRequired');
      return;
    }

    const newArticle = {
      id: `kb-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      snippet: `${newContent.slice(0, 100)}...`,
      views: 1,
      updated: 'Just now',
    };
    setArticles((currentArticles) => [newArticle, ...currentArticles]);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewCategory('');
      setValidationError('');
    }, 1200);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.snippet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="knowledge-base-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('knowledgeBase.title')}</h1>
          <p className="page-subtitle">{t('knowledgeBase.subtitle')}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setValidationError('');
            setIsModalOpen(true);
          }}
        >
          ➕ {t('knowledgeBase.newArticleBtn')}
        </Button>
      </div>

      {/* Search Header Bar */}
      <Card className="kb-search-card">
        <Input
          placeholder={t('knowledgeBase.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <div className="kb-layout">
        {/* Sidebar Categories */}
        <div className="kb-sidebar">
          <Card title={t('knowledgeBase.categories')}>
            <div className="category-list">
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.name}</span>
                  <span className="category-badge">{cat.count}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Article Grid */}
        <div className="kb-content">
          {filteredArticles.length > 0 ? (
            <div className="articles-grid">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="article-card">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-snippet">{article.snippet}</p>
                  <div className="article-footer">
                    <span>👁️ {article.views} {t('knowledgeBase.views')}</span>
                    <span>{t('knowledgeBase.updated')}: {article.updated}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="no-results-card">
              <p>{t('knowledgeBase.noResults')}</p>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setValidationError('');
          setIsModalOpen(false);
        }}
        title={t('kb.modal.title')}
      >
        {isSuccess ? (
          <div className="success-banner">✅ {t('kb.modal.successMsg')}</div>
        ) : (
          <form onSubmit={handleCreateArticle} className="modal-form">
            {validationError && <div className="form-error">{t(validationError)}</div>}
            <Input
              label={t('kb.modal.articleTitle')}
              placeholder={t('kb.modal.articleTitlePlaceholder')}
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                setValidationError('');
              }}
            />
            <div className="form-group">
              <label className="form-label">{t('kb.modal.category')}</label>
              <select
                className="form-select"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setValidationError('');
                }}
              >
                <option value="">{t('kb.modal.categoryPlaceholder')}</option>
                <option value="getting-started">Getting Started</option>
                <option value="dns-domains">Domain & DNS</option>
                <option value="account-billing">Account & Billing</option>
                <option value="api-webhooks">API & Webhooks</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('kb.modal.content')}</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder={t('kb.modal.contentPlaceholder')}
                value={newContent}
                onChange={(e) => {
                  setNewContent(e.target.value);
                  setValidationError('');
                }}
              />
            </div>
            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setValidationError('');
                  setIsModalOpen(false);
                }}
              >
                {t('kb.modal.cancelBtn')}
              </Button>
              <Button type="submit" variant="primary">
                {t('kb.modal.saveBtn')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeBase;