import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Button } from '../../styles/globalStyles';
import Header from '../../components/layout/Header';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Book {
  ageGroup:string;
  bookAuthor:string;
  bookId:number;
  bookImage:string;
  bookPage:string;
  bookSummary:string;
  bookTitle:string;
  genreName:string;
  mbtiInfo:string;
  publisher:string;
  topicNames:string[];
}

const Index = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await axios.get(`/kkumteul/api/books/${id}`);
        setBook(response.data.response);
        console.log(response.data.response);
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

    const handleLike = async (likeType:string) => {
      try {
        const response = await axios.post('/kkumteul/api/books/like', {
          bookId: book?.bookId,
          childProfileId: 2, // 추후에 동적으로 설정
          likeType: likeType,
        },  {
                 withCredentials: true, // 인증 정보를 포함하도록 설정
               });
        alert(response.data.response);
        console.log("좋아요 성공/ 싫어요 성공");
      } catch (error) {
        console.error('Error processing like/dislike:', error);
        alert(error);
      }
    };

  if (loading) {
    return <Container color="null">로딩 중...</Container>;
  }

  if (!book) {
    console.log("Book object is null or undefined");
    return;
  }

  return (
    <Container color="#FFD869">
      <Header
        textcolor="#000000"
        color="#FFD869"
        title={book.bookTitle}
        nextPage="/"
        nextBtnImageUrl="/assets/home.svg"
      />

      <BookImage src={`data:image/jpeg;base64,${book.bookImage}`} alt={book.bookTitle} />
      <BookInfo>
        <BookTitle>{book.bookTitle}</BookTitle>
        <Author>{book.bookAuthor}</Author>

        <TitleText>MBTI</TitleText>
        <MbtiValue>{book.mbtiInfo}</MbtiValue>

        <TitleText>줄거리 </TitleText>
        <SummaryContainer>
          <Summary>{book.bookSummary}</Summary>
        </SummaryContainer>

        <InfoWrapper>
          <TitleText>장르</TitleText>
          <InfoValue>{book.genreName}</InfoValue>
        </InfoWrapper>

        <InfoWrapper>
          <TitleText>주제</TitleText>
          <InfoValue>{Array.isArray(book.topicNames) ? book.topicNames.join(', ') : book.topicNames}</InfoValue>
        </InfoWrapper>

        <InfoWrapper>
          <TitleText>추천 연령</TitleText>
          <InfoValue>{book.ageGroup}</InfoValue>
        </InfoWrapper>

        <InfoWrapper>
          <TitleText>페이지 수</TitleText>
          <InfoValue>{book.bookPage}</InfoValue>
        </InfoWrapper>

        <InfoWrapper>
          <TitleText>출판사</TitleText>
          <InfoValue>{book.publisher}</InfoValue>
        </InfoWrapper>
      </BookInfo>

      <ButtonContainer>
        <LikeButton onClick={() => handleLike('LIKE')} color="#757575" backcolor="#ffffff">
          좋아요
        </LikeButton>
        <DisLikeButton onClick={() => handleLike('DISLIKE')} color="#757575" backcolor="#ffffff">
          싫어요
        </DisLikeButton>
      </ButtonContainer>
    </Container>
  );
};

export default Index;

const BookImage = styled.img`
  width: 180px;
  height: 240px;
  object-fit: cover;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  margin: 80px 0 0 0;
  z-index: 100;
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
`;

const BookTitle = styled.h2`
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 2px;
  text-align: center;
  color: #000000;
`;

const Author = styled.h3`
  font-size: 16px;
  color: #757575;
  text-align: center;
  margin: 0;
`;

const TitleText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #757575;
`;

const InfoValue = styled.span`
  font-size: 16px;
  margin-left: 10px;
`;

const MbtiValue = styled.span`
  font-size: 47px;
  color: #FFC317;
  margin-bottom: 30px;
`;

const SummaryContainer = styled.div`
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  margin: 10px 0 20px 0;
  padding: 0 20px;
  overflow-y: auto; // 줄거리 길이에 따라
`;

const Summary = styled.p`
  font-size: 14px;
  margin: 20px 0;
  line-height: 1.5;
  color: #757575;
`;

const InfoWrapper = styled.div`
  display: flex;
  color: gray;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  width: 80%;
  gap: 10px;
  margin: 60px 0;
`;

const LikeButton = styled(Button)`
  border: 4px solid #FFC317;
  font-size: 16px;
  &:hover {
    background-color: #FFC317;
    color: #ffffff;
  }
`;

const DisLikeButton = styled(Button)`
  border: 4px solid #6EA7D0;
  font-size: 16px;
  &:hover {
    background-color: #6EA7D0;
    color: #ffffff;
  }
`;
