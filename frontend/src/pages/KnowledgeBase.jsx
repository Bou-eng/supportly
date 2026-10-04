import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLES } from '../constants/apiConstants';
import { knowledgeApi } from '../services/knowledgeApi';
import { useActionLock } from '../hooks/useActionLock';
import './KnowledgeBase.css';

const EMPTY_FORM = { title: '', summary: '', content: '', category: '' };
const getArticleId = (article) => article?._id || article?.id;

const KnowledgeBase = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { role } = useAuth();
  const canEdit = role === USER_ROLES.ADMIN;
  const canPublish = [USER_ROLES.MANAGER, USER_ROLES.ADMIN].includes(role);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [operation, setOperation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { locked: savingLocked, runOnce: runSaveOnce } = useActionLock();

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await knowledgeApi.list({
        page,
        limit: 12,
        search: searchTerm || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
      });
      setArticles(result.articles || []);
      setPages(result.pages || 1);
    } catch (requestError) {
      setError(requestError.response?.status === 401 ? 'You are not authorized to view articles.' : 'Unable to load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    knowledgeApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadArticles();
  }, [page, searchTerm, selectedCategory]);

  const openCreate = () => {
    setEditingArticle(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const openEdit = (article) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      summary: article.summary || '',
      content: article.content,
      category: article.category?._id || '',
    });
    setError('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    await runSaveOnce(async () => {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      try {
        const payload = { ...form, category: form.category || null };
        const savedArticle = editingArticle ? await knowledgeApi.update(getArticleId(editingArticle), payload) : await knowledgeApi.create(payload);
        setIsModalOpen(false);
        setSuccessMessage(editingArticle ? 'Article updated successfully.' : 'Article created successfully.');
        setSearchTerm('');
        setSelectedCategory('all');
        setPage(1);
        setArticles((current) => [savedArticle, ...current.filter((article) => getArticleId(article) !== getArticleId(savedArticle))]);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to save article.');
      } finally {
        setSaving(false);
      }
    });
  };

  const handlePublish = async (article) => {
    const articleId = getArticleId(article);
    if (!articleId) {
      setError('This article has no valid identifier. Reload the page and try again.');
      return;
    }

    setOperation(`publish:${articleId}`);
    setError('');
    setSuccessMessage('');
    try {
      const updated = await knowledgeApi.publish(articleId, !article.published);
      setArticles((current) => current.map((item) => getArticleId(item) === articleId ? updated : item));
      setSuccessMessage(updated.published ? 'Article published successfully.' : 'Article unpublished successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update publication status.');
    } finally {
      setOperation('');
    }
  };
  const handleDelete = async (article) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    const articleId = getArticleId(article);
    if (!articleId) {
      setError('This article has no valid identifier. Reload the page and try again.');
      return;
    }

    setOperation(`delete:${articleId}`);
    setError('');
    setSuccessMessage('');
    try {
      await knowledgeApi.remove(articleId);
      setArticles((current) => current.filter((item) => getArticleId(item) !== articleId));
      setSuccessMessage('Article deleted successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete article.');
    } finally {
      setOperation('');
    }
  };

  return (
    <div className="knowledge-base-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('knowledgeBase.title')}</h1>
          <p className="page-subtitle">{t('knowledgeBase.subtitle')}</p>
        </div>
        {canEdit && <Button variant="primary" onClick={openCreate}>+ {t('knowledgeBase.newArticleBtn')}</Button>}
      </div>

      {error && <Card className="no-results-card"><p>{error}</p></Card>}
      {successMessage && <Card className="success-banner"><p>{successMessage}</p></Card>}

      <Card className="kb-search-card">
        <Input
          placeholder={t('knowledgeBase.searchPlaceholder')}
          value={searchTerm}
          onChange={(event) => { setPage(1); setSearchTerm(event.target.value); }}
        />
      </Card>

      <div className="kb-layout">
        <div className="kb-sidebar">
          <Card title={t('knowledgeBase.categories')}>
            <div className="category-list">
              <button className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => { setPage(1); setSelectedCategory('all'); }}>
                <span>All Categories</span>
              </button>
              {categories.map((category) => (
                <button key={category._id} className={`category-item ${selectedCategory === category._id ? 'active' : ''}`} onClick={() => { setPage(1); setSelectedCategory(category._id); }}>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="kb-content">
          {loading ? <Card className="no-results-card"><p>Loading articles...</p></Card> : articles.length === 0 ? <Card className="no-results-card"><p>{t('knowledgeBase.noResults')}</p></Card> : (
            <div className="articles-grid">
              {articles.map((article) => (
                <Card key={article._id} className="article-card">
                  <h3 className="article-title">{article.title}</h3>
                  <p className="article-snippet">{article.summary || article.content.slice(0, 140)}</p>
                  <div className="article-footer">
                    <span>{article.category?.name || 'Uncategorized'}</span>
                    <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {(canEdit || canPublish) && <div className="modal-actions">
                    {canEdit && <Button variant="outline" disabled={Boolean(operation)} onClick={() => openEdit(article)}>Edit</Button>}
                    {canPublish && <Button variant="outline" isLoading={operation === `publish:${getArticleId(article)}`} onClick={() => handlePublish(article)}>{article.published ? 'Unpublish' : 'Publish'}</Button>}
                    {canEdit && <Button variant="outline" isLoading={operation === `delete:${getArticleId(article)}`} onClick={() => handleDelete(article)}>Delete</Button>}
                  </div>}
                </Card>
              ))}
            </div>
          )}
          {!loading && pages > 1 && <div className="pagination-controls">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <span>Page {page} of {pages}</span>
            <Button variant="outline" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingArticle ? 'Edit article' : t('kb.modal.title')}>
        <form onSubmit={handleSave} className="modal-form">
          {error && <div className="form-error">{error}</div>}
          <Input label={t('kb.modal.articleTitle')} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <Input label="Summary" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option value="">Uncategorized</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-textarea" rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
          </div>
          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={saving}>Save article</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
