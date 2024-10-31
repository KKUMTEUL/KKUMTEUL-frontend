import styled, { keyframes } from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {Container} from '../../styles/globalStyles';
import LoginModal from '../../modal/LoginModal';
import axiosWithToken from '../../axiosWithToken.ts';
import FontStyles from '../../styles/globalStyles.ts';


interface Event {
  eventId: number;
  eventName: string;
  eventDescription: string;
  startDate: string;
  expiredDate: string;
}


interface PopularBooks {
    bookId: number
    bookTitle: string
    bookImage: string
}

interface RecommendBook {
    bookId: number;
    bookTitle: string;
    bookImage: string;
}

interface Menu {
    id: number;
    name: string;
    link: string;
    image: string;
}

interface ChildProfile {
    childName: string;
    profileId: number;
    childProfileImage: string;
}

const Index = () => {
  const navigate = useNavigate();

  const onClickPrevButton = () => {
    navigate(-1);
  }

  const [childProfileId, setChildProfileId] = useState<number | null>(
    parseInt(sessionStorage.getItem('childProfileId') || '0') || null
  );

  const [isToggleMenuOpen, setIsToggleMenuOpen] = useState(false);
  const [childProfileList, setChildProfileList] = useState<ChildProfile[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<RecommendBook[]>([]);
  const [eventData, setEventData] = useState<Event>();
  const [popularBooks, setPopularBooks] = useState<PopularBooks[]>([]);
  const [childName, setChildName] = useState<string>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 로그인 유무
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const menus: Menu[] = [
    {id: 0, name: 'MBTI 검사', link: '/survey', image: '/assets/menu_mbti.png'},
    {id: 1, name: '도서 목록', link: '/booklist', image: '/assets/menu_book.png'},
    {id: 2, name: '마이페이지', link: '/mypage', image: '/assets/menu_mypage.png'},
  ]

  const toggleMenu = () => {
    if(!isLoggedIn) {
      setIsModalOpen(true); // 로그인 안했을 때 모달창 보여주기
    }
      setIsToggleMenuOpen(prev => !prev); // 로그인 했을 때 토글 목록 보여주기
  };


  const onClickEventBanner = () => {
      if (!isLoggedIn) {
          alert('로그인이 필요합니다.');
          navigate('/login');
      } else if (eventData == null){
        alert("진행중인 이벤트가 없습니다!");
      } else {
        navigate('/event', {state: eventData});
      }
  }

  const onClickToggleMenuItem = (profile: ChildProfile) => {
    sessionStorage.setItem('childProfileId', profile.profileId.toString());
    setChildProfileId(profile.profileId);
    setChildName(profile.childName);
    fetchRecommendedBooks(profile.profileId);

    alert("프로필 변경이 완료되었습니다.");
  };

    const onClickMenuItem = (menuId: number, menuLink: string) => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('/login'); // 로그인 화면으로 이동
            return;
        }

        if (menuId === 0 && !childProfileId) {
            alert('자녀 프로필을 선택해주세요.');
            return;
        }

        navigate(menuLink);
    };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
      const accessToken = sessionStorage.getItem('accessToken');
      setIsLoggedIn(!!accessToken);
      
      // 자녀 프로필 리스트 조회
      const fetchChildProfiles = async () => {
          try {
              const response = await axiosWithToken.get(`/kkumteul/api/childProfiles`);
              const childProfiles = response.data.response;
              console.log(childProfiles);
              setChildProfileList(childProfiles);
          } catch (error) {
              console.error('Failed to fetch child profiles:', error);
          }
      };

      // 자녀 프로필 유효성 검증 api 연동 및 추천 도서 조회 함수 호출
      const fetchChildProfileAndRecommendedBooks = async () => {
          if (childProfileId && childProfileId > 0) {
              try {
                  const response = await axiosWithToken.get(`/kkumteul/api/users/childProfiles/${childProfileId}`);
                  console.log(response.data);
                  await fetchRecommendedBooks(childProfileId);
              } catch (error) {
                  console.error('Failed to fetch child profile:', error);
                  alert('잘못된 접근입니다.');
              }
          } else {
            // 없으면 childProfileId = 0
            setChildName('다른');
            await fetchRecommendedBooks(0);
          }
      };

      console.log('로그인상태' + isLoggedIn);
      console.log('토큰' + accessToken);

      if(isLoggedIn){
        fetchChildProfiles();
        fetchChildProfileAndRecommendedBooks();  
        fetchCurrentEvent();
      } else{        
        fetchChildProfileAndRecommendedBooks();  
      }
      

  }, [isLoggedIn]);

  console.log(childProfileList);

  // 추천 도서 목록 조회
  const fetchRecommendedBooks = async (childProfileId: number) => {
      try {
          const url = childProfileId != 0 ? `/kkumteul/api/recommendation/books?childProfileId=${childProfileId}`: `/kkumteul/api/recommendation/books`;
          const response = await axiosWithToken.get(url);
          const recommendedBooks = response.data.response.recommendedBooks;
          const popularBooks = response.data.response.popularBooks;
          console.log("추천책:", recommendedBooks);
          console.log("인기책(추천도서가 없을경우): ", popularBooks);
          setRecommendedBooks(recommendedBooks);
          setPopularBooks(popularBooks);
      } catch (error) {
          console.error('Failed to fetch recommended books:', error);
      }
  };

  const handleAddChildProfile = () => {
    navigate('/mypage/createChildProfile');
  }

  const formatImageSrc = (imageData: string | null) => {
      return imageData ? `data:image/png;base64,${imageData}` : '/assets/dog.svg';
  };
    

  // 현재 진행중인 이벤트 정보 조회
  const fetchCurrentEvent = async() => {
    try {
      const response = await axiosWithToken.get(`/kkumteul/api/events`);
      console.log("이벤트:", response.data.response);
      setEventData(response.data.response);
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <Container color="#fdf8d7">
      <FontStyles/>
      <Header>
          <PrevButton onClick={onClickPrevButton} $imageurl="/assets/prev_button.svg"></PrevButton>
          <Title>꿈틀</Title>
          <NextButton onClick={toggleMenu} $imageurl="/assets/menu.svg"></NextButton>
          {!isLoggedIn && isModalOpen && (
          <LoginModal isOpen={isModalOpen} onClose={handleCloseModal} />
         )}
          
          {isLoggedIn && isToggleMenuOpen && (
          <DropdownMenu>
            {childProfileList.length > 0 ? (
              childProfileList.map((profile) => (
                <DropdownItem
                  key={profile.profileId}
                  onClick={() => onClickToggleMenuItem(profile)}
                >
                <LinkContainer>
                <LinkImage src={formatImageSrc(profile.childProfileImage)} alt={profile.childName} />
                <LinkTitle $color="#6EA7D0">{profile.childName}</LinkTitle>
                </LinkContainer>
                
                </DropdownItem>
              ))
            ) : (
              <>
                <DropdownItem onClick={handleAddChildProfile}>
                  <LinkTitle $color='#FFC317'>자녀 추가하기</LinkTitle>
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        )}
      </Header>

      <ImageWrapper>
        <Image src="/assets/rabbit.png" alt="Main Test" />      
      </ImageWrapper> 

      <MenuSection>
      {menus.map((menu) => (
        <Menus key={menu.id} onClick={() => onClickMenuItem(menu.id, menu.link)}>
          <LinkButton src={menu.image}/>
          <LinkTitle $color='#ffffff'>{menu.name}</LinkTitle>
        </Menus>
      ))}
      </MenuSection>  
      
      <EventBanner onClick={onClickEventBanner}>
        <EventTitle>선착순 100명 이벤트</EventTitle>
        <EventText>오늘 오후 1시! 행운의 당첨자는?</EventText>
      </EventBanner>
          {/* <RecommendTitle>🐰 꿈틀이를 위한 오늘의 책 추천</RecommendTitle> */}

          <RecommendTitleSection>
            <RecommendTitleImage src="/assets/help.png"></RecommendTitleImage>
            <RecommendTitleText>
            <RecommendTitle>책을 선택하는</RecommendTitle>
            <RecommendTitle>고민의 시간을 덜어드려요 </RecommendTitle>
            <RecommendExplainText>꿈틀이 맞춤 도서를 매일 알려드려요!</RecommendExplainText>
          </RecommendTitleText>
            
          </RecommendTitleSection>
          


          <RecommendBookSection>
              <ArrowBubble>
                  <RecommendText>{childName} 꿈틀이는 어떤 책을 좋아할까??</RecommendText>
              </ArrowBubble>
              
              <RecommendContainer>
                  <MbtiImage/>
                  {recommendedBooks.map((book) => (
                      <RecommendItem key={book.bookId}>
                          <RecommendBookImage
                              onClick={() => navigate(`/booklist/${book.bookId}`)}
                              $imageurl={formatImageSrc(book.bookImage)}
                          />
                      </RecommendItem>
                  ))}
              </RecommendContainer>
          </RecommendBookSection>
          {/* <RecommendTitle>🦊 꿈틀이를 위한 인기 도서</RecommendTitle> */}
          <RecommendBookSection>
              <ArrowBubble>
                  <RecommendText>꿈틀이의 친구들은 어떤 책을 좋아할까요?</RecommendText>
              </ArrowBubble>
              <RecommendContainer>
                  {popularBooks.map((book) => (
                      <RecommendItem key={book.bookId}>
                          <RecommendBookImage
                              onClick={() => navigate(`/booklist/${book.bookId}`)}
                              $imageurl={formatImageSrc(book.bookImage)}
                          />
                          {/* <RecommendBookTitle>{book.bookTitle}</RecommendBookTitle> */}
                      </RecommendItem>
                  ))}
              </RecommendContainer>
          </RecommendBookSection>
      </Container>
    );
  };


export default Index;

const Header = styled.div`
    width: 100%;
    height: 60px;
    background-color: #fee208;
    align-items: center;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1000;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 60px;
    right: 10px;
    width: 200px;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    z-index: 1001;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 2px solid #fee208;;

`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    padding: 20px 0;
    cursor: pointer;
    width: 100%;
    justify-content: center;
`;

const Title = styled.h2`
    margin: 0;
    color: #000000;
    font-size: 18px;
    font-family: 'CookieRunRegular', sans-serif;
`;

const PrevButton = styled.button<{ $imageurl: string }>`
    width: 30px;
    height: 30px;
    padding: 0;
    background: no-repeat center/cover url(${({$imageurl}) => $imageurl});
`
const NextButton = styled.button<{ $imageurl: string }>`
    width: 25px;
    height: 25px;
    padding: 0;
    background: no-repeat center/cover url(${({$imageurl}) => $imageurl});
    overflow: hidden;
`

const ImageWrapper = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Image = styled.img`
    width: 100%;
`

// 링크
const MenuSection = styled.div`
    width: 95%;
    height: 100px;
    background-color: #ffffff;
    margin: 20px 10px 0 10px;
    border-radius: 20px;
    box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 40px;
`;

const Menus = styled.div`
    flex-direction: column;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 20px 0;
`

const LinkButton = styled.img`
    width: 45px;
    height: 45px;
    padding: 0;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: translateY(-5px);
    }
`

const LinkContainer = styled.div`
 display: flex;
 flex-direction: column;
 align-items: center;
 margin: 0;
 padding: 0;
 
`

const LinkImage = styled.img`
  width: 40px;
  height: 40px;
  border: 2px solid #fee208;
  border-radius: 100px;
  margin-bottom: 4px;
  transition: transform 0.2s ease;
    
    &:hover {
        transform: translateY(-5px);
    }
  
`

const LinkTitle = styled.p<{ $color: string }>`
    font-size: 12px;
    padding: 0;
    margin: 0;

    &:hover {
        color: ${({$color}) => $color}
    }

`

// 이벤트 배너
const EventBanner = styled.div`
    width: 95%;
    height: 100px;
    background-color: #ffd8df;
    margin: 20px 10px 30px 10px;
    border-radius: 20px;
    box-shadow: 0 0 4px 4px rgba(0, 0, 0, 0.03);
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    border: 4px solid #ec8396;
    flex-direction: column;
    padding: 30px;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: translateY(-5px);
    }
`;

const EventTitle = styled.p`
    font-weight: bold;
    font-size: 30px;
    color: #ec8396;
    margin: 0;
`

const EventText = styled.p`
  margin: 0;
  color: #7e4747;

`

// 도서 추천

const RecommendBookSection = styled.div`
    width: 95%;
    background-color: #fee208;
    border-radius: 20px;
    margin: 12px 10px 20px 10px;
    padding: 20px 20px 40px 20px;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    
`;

const RecommendTitleSection = styled.div`
  width: 90%;
  display: flex;
  margin-top: 20px;
`


const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const RecommendTitleImage = styled.img`
  width: 44px;
  height: 44px;
  margin-right: 20px;
  animation: ${bounce} 1s infinite;
`;


const RecommendTitleText = styled.div`
  width: 100%;
  
`

const RecommendTitle = styled.h2`
    margin-bottom: 0px;
    width: 90%;
    color: #605951;
    margin: 0;

`;
const RecommendExplainText = styled.p`
  color: #FFC317;
  margin: 2px;
  font-weight: bold;
`

const RecommendText = styled.p`
    margin: 0;
    color: #ffffff;
    font-size: 18px;
    text-align: center;
`;

const ArrowBubble = styled.div`
    margin: 10px;
    position: relative;
    width: 90%;
    height: auto;
    padding: 10px;
    background: #FFC317;
    border-radius: 30px;
    border: #FFC317 solid 3px;

    @media screen and (max-width: 500px) {
        width: 90%;
        height: auto;
    }

    ::after {
        content: "";
        position: absolute;
        border-style: solid;
        border-width: 10px 15px 0;
        border-color: #FFC317 transparent;
        display: block;
        width: 0;
        z-index: 1;
        bottom: -4px;
        left: 15px;
        @media screen and (max-width: 650px) {
            left: 5px;
        }
    }

    ::before {
        content: "";
        position: absolute;
        border-style: solid;
        border-width: 8px 12px 0;
        border-color: #FFC317 transparent;
        display: block;
        width: 0;
        z-index: 0;
        bottom: -8px;
        left: 18px;
        @media screen and (max-width: 650px) {
            left: 8px;
        }
    }
`;

const RecommendContainer = styled.div`
    display: flex;
    flex-wrap: nowrap;
    overflow-x: scroll;
    gap: 0;
    width: 100%;

    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const MbtiImage = styled.div`
    width: 80px;
    height: 80px;
    background: no-repeat center/contain url("/assets/kkumteul_character.png");
    padding: 0;
    flex-shrink: 0;
    margin-top: 20px;
`;

// 추천 책 리스트
const RecommendItem = styled.div`
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 10px 0 0;
    justify-content: flex-start;
    cursor: pointer;
`;

const RecommendBookImage = styled.img<{ $imageurl: string }>`
  width: 90px;
  height: 120px;
  background: no-repeat center/cover url(${({$imageurl}) => $imageurl});
  padding: 0;
  margin: 0;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  &:hover {
        transform: scale(1.05);
    }

    &.active {
        transform: scale(0.9); 
        transition: transform 0.1s ease;
    }
`;

const RecommendBookTitle = styled.p`
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #757575;
    word-wrap: break-word;
    white-space: normal;
    text-align: center;
`;