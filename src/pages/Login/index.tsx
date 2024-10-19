import React, { useState } from 'react'; //241017
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Input } from '../../styles/globalStyles';
import Header from '../../components/layout/Header';
import styled from 'styled-components';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', {
        username,
        password,
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      alert('로그인 실패');
    }
  };

  return (
    <Container color='#FDDC69'>
      <Header textcolor="#000000" color="#FDDC69" nextBtnImageUrl="/assets/home.svg" title="로그인" nextPage="/" />
      <ContentContainer>
        <CharacterWrapper>
            <CharacterImage src="/assets/kkumteul_character.png" alt="character" />
        </CharacterWrapper>
        <Form onSubmit={handleLogin}>
            <LoginInput color='#FFCB05' placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
            <LoginInput color='#FFCB05' placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <LoginButton color='#ffffff' backcolor='#FFCB05'type="submit">로그인</LoginButton>
        </Form>
        <SignUpLink onClick={() => navigate('/signup')}>회원가입하러 가기</SignUpLink>
      </ContentContainer>
  </Container>
);
};

export default Login;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const CharacterWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
`;

const CharacterImage = styled.img`
  width: 150px;
  height: 150px;
  margin: 100px 0 50px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70%;
  gap: 20px;
`;

const LoginInput = styled(Input)`
  height: 64px;
  
`;

const LoginButton = styled(Button)`
  width: 100%;
  font-size: 20px;
`;

const SignUpLink = styled.p`
  color: #74A5D0;
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
`;

