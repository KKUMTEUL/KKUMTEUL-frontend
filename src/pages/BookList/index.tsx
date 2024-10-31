import styled from 'styled-components';
import { Container, Input } from '../../styles/globalStyles';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {KeyboardEvent} from 'react';

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
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const booksPerPage = 12;

  const fetchBooks = async (page, keyword = "") => {
    try {
      const response = await axios.get(`/kkumteul/api/books?page=${page}&size=${booksPerPage}&keyword=${keyword}`);
      setBooks(response.data.response.content);
      setTotalPages(response.data.response.totalPages);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage, keyword); // 초기 로딩 시 전체 도서 목록 조회
  }, []);

  const handlePageClick = (pageNumber:number) => {
    fetchBooks(pageNumber, keyword);
    setCurrentPage(pageNumber);
  };

  const handleBookClick = (id:number) => {
    navigate(`/booklist/${id}`);
  };

  const handleSearch = () => {
    setCurrentPage(0); // 검색 시 페이지를 0으로 초기화
    fetchBooks(0, keyword); // 페이지를 0으로 설정하고 키워드로 다시 데이터 로드
  };

  const handleKeyPress = (e:KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNextPageSet = () => {
    const nextPageSet = Math.floor(currentPage / 5) * 5 + 5;
    if (nextPageSet < totalPages) {
      setCurrentPage(nextPageSet);
    }
  };

  const handlePreviousPageSet = () => {
    const prevPageSet = Math.floor(currentPage / 5) * 5 - 5;
    if (prevPageSet >= 0) {
      setCurrentPage(prevPageSet);
    }
  };

  const renderPagination = () => {
    const pageButtons = [];
    const startPage = Math.floor(currentPage / 5) * 5; // 현재 페이지 기준으로 5의 배수 시작
    const endPage = Math.min(startPage + 4, totalPages - 1); // 현재 페이지 기준으로 최대 4개의 버튼

    for (let i = startPage; i <= endPage; i++) {
      if (i < totalPages) { // 총 페이지 수보다 작은 경우에만 버튼 추가
        pageButtons.push(
          <PageButton
            key={i}
            onClick={() => handlePageClick(i)}
            isActive={i === currentPage}
          >
            {i + 1}
          </PageButton>
        );
      }
    }

    return (
      <>
        <PaginationButton onClick={handlePreviousPageSet} disabled={currentPage === 0}>
          &lt;
        </PaginationButton>
        {pageButtons}
        <PaginationButton onClick={handleNextPageSet} disabled={currentPage + 5 >= totalPages}>
          &gt;
        </PaginationButton>
      </>
    );
  };

  return (
    <Container color="#f3f3f3">
      <Header textcolor="#000000" color="#f3f3f3" nextBtnImageUrl="/assets/home.svg" title="도서 목록" nextPage='/' />
      <SearchContainer>
        <Input
          placeholder="검색어 입력"
          color="#6EA7D0"
          inputcolor="#E6E6E6"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress} // Enter 키 이벤트 추가
        />
        <SearchButton onClick={handleSearch} /> {/* 검색 버튼 클릭 시 검색 함수 호출 */}
      </SearchContainer>
      <GridContainer>
        {books.map((book) => (
          <BookCard key={book.bookId} onClick={() => handleBookClick(book.bookId)}>
            <BookImage src={`data:image/jpeg;base64,${book.bookImage}`} alt={book.bookTitle} />
            <BookInfo>
              <BookTitle>{book.bookTitle}</BookTitle>
              <BookTopic>{book.topicNames.join(', ')}</BookTopic>
            </BookInfo>
          </BookCard>
        ))}
      </GridContainer>
      <Pagination>
        {renderPagination()} {/* 페이지네이션 버튼 렌더링 */}
      </Pagination>
    </Container>
  );
};

export default Index;

const GridContainer = styled.div`
  display: flex;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 90%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const BookCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 140px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #FFD869;
  }
`;

const BookImage = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  margin-bottom: 0px;
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BookTitle = styled.h3`
  font-size: 12px;
  font-weight: bold;
  margin: 8px 0 0 0;
`;

const BookTopic = styled.span`
  font-size: 10px;
  color: #888;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  width: 90%;
`;

const SearchButton = styled.button`
  width: 24px;
  height: 24px;
  background: url('/assets/search.svg') center / contain no-repeat;
  border: none;
  cursor: pointer;
  margin-left: 10px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const PageButton = styled.button`
  border: none;
  background-color: ${props => (props.isActive ? '#fac737' : '#FFD869')};
  color: white;
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: #fac737;
  }
`;

const PaginationButton = styled.button`
  border: none;
  background-color: #FFD869;
  color: white;
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: #fac737;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
