// Sample data para ma-review ang design kahit wala pang backend.
// Kapag may backend na, papalitan ito ng tunay na API response.

export const MOCK_PORTFOLIO = {
  slug: 'juan-dela-cruz',
  name: 'Juan Dela Cruz',
  headline: 'BSIT Student • Aspiring Web Developer',
  bio: 'Second-year BSIT student sa MarSU. Mahilig sa web development at community tech trainings. Naghahanap ng OJT at freelance opportunities.',
  email: 'juan.delacruz@marsu.edu.ph',
  studentId: '2023-00123',
  course: 'BSIT',
  yearLevel: '2nd',
  section: 'BSIT-2A',
  avatarInitials: 'JD',
  skills: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Canva'],
  achievements: [
    {
      _id: 'a1',
      title: 'Web Development Bootcamp Certificate',
      category: 'training',
      issuer: 'DICT Region IV-B',
      dateReceived: '2025-11-20',
      description: '3-day bootcamp tungkol sa HTML, CSS, at JavaScript fundamentals.',
      proofType: 'file',
      fileUrl: null,
    },
    {
      _id: 'a2',
      title: "Dean's Lister — 1st Semester A.Y. 2025–2026",
      category: 'award',
      issuer: 'MarSU College of Computing Studies',
      dateReceived: '2026-01-15',
      description: 'Academic excellence award na may GWA na 1.45.',
      proofType: 'url',
      proofUrl: 'https://marsu.edu.ph/sample-award',
    },
    {
      _id: 'a3',
      title: 'Leadership Training Seminar',
      category: 'seminar',
      issuer: 'MarSU Student Affairs',
      dateReceived: '2025-09-05',
      description: 'Seminar tungkol sa student leadership at event management.',
      proofType: 'file',
      fileUrl: null,
    },
  ],
};

export const MOCK_SLUGS = ['juan-dela-cruz', 'demo'];
