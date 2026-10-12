import { useEffect, useMemo, useState } from 'react';
import {
  ACCEPTED_TYPES,
  CATEGORIES,
  CATEGORY_LABELS,
  MAX_FILE_MB,
  createAchievement,
  deleteAchievement,
  getPreviewUrl,
  listAchievements,
  updateAchievement,
} from '../api/achievements';

const EMPTY_FORM = {
  title: '',
  category: 'certificate',
  issuer: '',
  dateReceived: new Date().toISOString().slice(0, 10),
  description: '',
  proofType: 'file',
  file: null,
  proofUrl: '',
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatSize(bytes) {
  if (!bytes) return '';
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function validateForm(form, isEdit) {
  if (!form.title.trim()) return 'Lagyan ng title ang achievement.';
  if (!CATEGORIES.includes(form.category)) return 'Pumili ng valid na category.';
  if (form.proofType === 'url') {
    if (!form.proofUrl.trim()) return 'Ilagay ang proof link (https://...).';
    try {
      const u = new URL(form.proofUrl.trim());
      if (!['http:', 'https:'].includes(u.protocol)) return 'Ang proof link ay dapat http o https.';
    } catch {
      return 'Hindi valid ang proof link.';
    }
  } else if (!isEdit || form.file) {
    // Sa edit, pwedeng panatilihin ang lumang file kaya hindi required ang bagong file.
    if (!form.file) return 'Pumili ng PDF o larawan (max 5MB).';
    if (!ACCEPTED_TYPES.includes(form.file.type)) return 'PDF, JPG, PNG, o WebP lang ang pwede.';
    if (form.file.size > MAX_FILE_MB * 1024 * 1024)
      return `Lagpas sa ${MAX_FILE_MB}MB ang file. Paliitin muna o gumamit ng link.`;
  }
  return '';
}

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listAchievements());
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi ma-load ang achievements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { all: items.length };
    CATEGORIES.forEach((k) => {
      c[k] = items.filter((a) => a.category === k).length;
    });
    return c;
  }, [items]);

  const visible = filter === 'all' ? items : items.filter((a) => a.category === filter);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFilePreview(null);
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      category: item.category || 'certificate',
      issuer: item.issuer || '',
      dateReceived: (item.dateReceived || '').slice(0, 10),
      description: item.description || '',
      proofType: item.proofType || 'file',
      file: null,
      proofUrl: item.proofUrl || '',
    });
    setFilePreview(getPreviewUrl(item));
    setError('');
    setNotice('');
    setShowForm(true);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file: f }));
    if (f && f.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validateForm(form, !!editing);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (editing) {
        await updateAchievement(editing._id, form);
        setNotice('Na-update ang achievement.');
      } else {
        await createAchievement(form);
        setNotice('Nadagdag ang achievement.');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setFilePreview(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi nai-save. Subukan ulit.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Burahin ang achievement na ito?')) return;
    setDeletingId(id);
    try {
      await deleteAchievement(id);
      setItems((prev) => prev.filter((a) => a._id !== id));
      setNotice('Nabura ang achievement.');
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi nabura. Subukan ulit.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container wide">
      <div className="page-head">
        <div>
          <h2>My achievements</h2>
          <p className="muted">Mag-upload ng certificate o training — PDF/larawan (max 5MB) o proof link.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add achievement
        </button>
      </div>

      {notice && <p className="success">{notice}</p>}
      {error && !showForm && <p className="error">{error}</p>}

      <div className="filter-row">
        {['all', ...CATEGORIES].map((k) => (
          <button
            key={k}
            type="button"
            className={`chip ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}
          >
            {k === 'all' ? 'All' : CATEGORY_LABELS[k]} ({counts[k] || 0})
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card form-card">
          <h3>{editing ? 'Edit achievement' : 'New achievement'}</h3>
          {error && <p className="error">{error}</p>}
          <div className="form-grid">
            <label>
              Title *
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Hal. Web Development Bootcamp Certificate"
                required
              />
            </label>
            <label>
              Category *
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Issuer / Organization
              <input
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                placeholder="Hal. DICT Region IV-B"
              />
            </label>
            <label>
              Date received
              <input
                type="date"
                value={form.dateReceived}
                onChange={(e) => setForm({ ...form, dateReceived: e.target.value })}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ano ang natutunan o nakuha dito?"
              rows={3}
            />
          </label>

          <div className="proof-toggle">
            <button
              type="button"
              className={form.proofType === 'file' ? 'chip active' : 'chip'}
              onClick={() => setForm({ ...form, proofType: 'file' })}
            >
              📎 Upload file
            </button>
            <button
              type="button"
              className={form.proofType === 'url' ? 'chip active' : 'chip'}
              onClick={() => setForm({ ...form, proofType: 'url' })}
            >
              🔗 Paste link
            </button>
          </div>

          {form.proofType === 'file' ? (
            <label>
              Proof file (PDF/JPG/PNG/WebP, max {MAX_FILE_MB}MB) {editing ? '' : '*'}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onFileChange} />
              {form.file && (
                <span className="muted">
                  {form.file.name} • {formatSize(form.file.size)}
                </span>
              )}
              {filePreview && form.file?.type.startsWith('image/') && (
                <img src={filePreview} alt="preview" className="file-preview" />
              )}
              {editing && !form.file && <span className="muted">Walang bagong file — pananatilihin ang luma.</span>}
            </label>
          ) : (
            <label>
              Proof link (https://...) *
              <input
                value={form.proofUrl}
                onChange={(e) => setForm({ ...form, proofUrl: e.target.value })}
                placeholder="Hal. https://drive.google.com/..."
                inputMode="url"
              />
              {form.proofUrl.trim() && (
                <a href={form.proofUrl.trim()} target="_blank" rel="noreferrer" className="pf-proof-link">
                  Buksan ang link para i-check ↗
                </a>
              )}
            </label>
          )}

          <div className="row">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving...' : editing ? 'Save changes' : 'Add achievement'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading achievements...</p>
      ) : visible.length === 0 ? (
        <div className="card empty">
          <p>{filter === 'all' ? 'Wala pang achievement. Magdagdag ng una mong certificate!' : `Walang ${CATEGORY_LABELS[filter]} pa.`}</p>
          <button onClick={openAdd} className="btn-primary">
            + Add achievement
          </button>
        </div>
      ) : (
        <div className="ach-list">
          {visible.map((a) => {
            const preview = getPreviewUrl(a);
            const isImage = preview && (a.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(preview));
            return (
              <article key={a._id} className="card ach-item">
                {isImage && <img src={preview} alt={a.title} className="ach-thumb" />}
                <div className="ach-body">
                  <div className="pf-ach-top">
                    <span className="pf-badge">{CATEGORY_LABELS[a.category] || a.category}</span>
                    <span className="pf-date">{formatDate(a.dateReceived)}</span>
                  </div>
                  <h4>{a.title}</h4>
                  {a.issuer && <p className="pf-issuer">{a.issuer}</p>}
                  {a.description && <p className="pf-desc">{a.description}</p>}
                  {a.proofType === 'url' && a.proofUrl ? (
                    <a href={a.proofUrl} target="_blank" rel="noreferrer" className="pf-proof-link">
                      View proof ↗
                    </a>
                  ) : (
                    <span className="pf-proof-file">
                      📎 {a.fileName ? `${a.fileName} • ${formatSize(a.fileSize)}` : 'Attachment uploaded'}
                    </span>
                  )}
                  <div className="row">
                    <button type="button" className="btn-secondary" onClick={() => openEdit(a)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => onDelete(a._id)}
                      disabled={deletingId === a._id}
                    >
                      {deletingId === a._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
