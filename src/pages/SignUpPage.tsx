import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, type SignUpRequest } from '../api/memberApi';
import './SignUpPage.css';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpRequest>({
    memberId: '',
    password: '',
    name: '',
    email: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || '회원가입에 실패했습니다');
      } else {
        setError('서버와 연결할 수 없습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>회원가입</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="memberId">아이디</label>
          <input
            type="text"
            id="memberId"
            name="memberId"
            value={formData.memberId}
            onChange={handleChange}
            placeholder="아이디 (4~50자)"
            required
            minLength={4}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>

        <div className="link-container">
          <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage;
