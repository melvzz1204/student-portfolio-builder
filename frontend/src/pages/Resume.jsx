import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../api/profile';

const EMPTY_EDU = { school: '', degree: '', startYear: '', endYear: '', details: '' };

export default function Resume() {
  const [profile, setProfile] = useState(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setPhone(p.phone || '');
        setSkills(p.skills || []);
        setEducation(p.education || []);
        setIsPublic(p.isPublic !== false);
      })
      .catch((err) => setError(err.response?.data?.message || 'Hindi ma-load ang resume.'))
      .finally(() => setLoading(false));
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (s.length > 40) {
      setError('Bawat skill ay hanggang 40 characters lang.');
      return;
    }
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setError('Nasa listahan na ang skill na iyan.');
      return;
    }
    if (skills.length >= 30) {
      setError('Hanggang 30 skills lang.');
      return;
    }
    setError('');
    setSkills([...skills, s]);
    setSkillInput('');
  };

  const addEducation = () => {
    if (education.length >= 10) {
      setError('Hanggang 10 education entries lang.');
      return;
    }
    setError('');
    setEducation([...education, { ...EMPTY_EDU }]);
  };

  const setEdu = (i, key, value) => {
    setEducation(education.map((e, j) => (j === i ? { ...e, [key]: value } : e)));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const updated = await updateMyProfile({ headline, bio, phone, skills, education, isPublic });
      setProfile(updated);
      setNotice('Nai-save ang resume mo. Makikita ito sa public portfolio mo.');
    } catch (err) {
      setError(err.response?.data?.message || 'Hindi nai-save. Subukan ulit.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="center">Loading resume...</p>;

  return (
    <div className="container wide">
      <div className="page-head">
        <div>
          <h2>My resume</h2>
          <p className="muted">
            {profile?.name} • {profile?.studentId} • {profile?.course} {profile?.yearLevel && `• ${profile.yearLevel} Year`}
          </p>
        </div>
        <Link to={`/p/${profile?.slug || 'demo'}`} className="btn-secondary">
          View public page ↗
        </Link>
      </div>

      {notice && <p className="success">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={onSubmit} className="card form-card">
        <h3>Headline at bio</h3>
        <label>
          Professional headline
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Hal. BSIT Student • Aspiring Web Developer"
            maxLength={120}
          />
        </label>
        <label>
          Tungkol sa akin (bio)
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ilang pangungusap tungkol sa iyo — kurso, interes, at hinahanap (OJT, freelance...)"
            rows={4}
            maxLength={1000}
          />
        </label>
        <div className="form-grid">
          <label>
            Contact number (optional)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Hal. 0912-345-6789"
              maxLength={30}
            />
          </label>
          <label>
            Public portfolio
            <select value={isPublic ? 'yes' : 'no'} onChange={(e) => setIsPublic(e.target.value === 'yes')}>
              <option value="yes">Naka-public — makikita ng employers</option>
              <option value="no">Naka-private — ikaw lang ang makakakita</option>
            </select>
          </label>
        </div>

        <h3>Skills ({skills.length}/30)</h3>
        <div className="row" style={{ marginTop: 0 }}>
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Hal. JavaScript"
            maxLength={40}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <button type="button" className="btn-secondary" onClick={addSkill}>
            + Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="pf-skills">
            {skills.map((s) => (
              <span key={s} className="pf-skill">
                {s}{' '}
                <button
                  type="button"
                  className="link-btn"
                  aria-label={`Alisin ang ${s}`}
                  onClick={() => setSkills(skills.filter((x) => x !== s))}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <h3>Education ({education.length}/10)</h3>
        {education.length === 0 && (
          <p className="muted">Wala pang education entry. Idagdag ang pinag-aralan mo — high school, senior high, kolehiyo.</p>
        )}
        {education.map((e, i) => (
          <div key={i} className="card" style={{ marginBottom: '0.75rem' }}>
            <div className="form-grid">
              <label>
                Paaralan *
                <input value={e.school} onChange={(ev) => setEdu(i, 'school', ev.target.value)} placeholder="Hal. Marinduque State University" />
              </label>
              <label>
                Degree / Strand
                <input value={e.degree} onChange={(ev) => setEdu(i, 'degree', ev.target.value)} placeholder="Hal. BS Information Technology" />
              </label>
              <label>
                Start year
                <input value={e.startYear} onChange={(ev) => setEdu(i, 'startYear', ev.target.value)} placeholder="Hal. 2023" />
              </label>
              <label>
                End year (o Expected)
                <input value={e.endYear} onChange={(ev) => setEdu(i, 'endYear', ev.target.value)} placeholder="Hal. 2027" />
              </label>
            </div>
            <label>
              Detalye (honors, activities...)
              <input value={e.details} onChange={(ev) => setEdu(i, 'details', ev.target.value)} placeholder="Hal. Dean's Lister, 1st Year" />
            </label>
            <button type="button" className="btn-danger" onClick={() => setEducation(education.filter((_, j) => j !== i))}>
              Alisin
            </button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addEducation}>
          + Add education
        </button>

        <div className="row">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Saving...' : 'Save resume'}
          </button>
          <Link to="/dashboard/achievements" className="btn-secondary">
            Sunod: Achievements →
          </Link>
        </div>
      </form>
    </div>
  );
}
