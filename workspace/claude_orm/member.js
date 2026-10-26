import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

(async () => {
    // 데이터 추가
    // .create()
    // const member1 = {
    //     memberEmail: "test123@gmail.com",
    //     memberPassword: "test123!@#",
    //     memberName: "홍길동",
    //     memberAge: 20,
    //     memberAddress: "서울시 강남",
    // }

    // const createdMember = await prisma.member.create({
    //     data: member1
    // })

    // console.log(createdMember)

    // 여러 개 데이터 추가
    // .createMany()
    // const members = [
    //     {
    //         memberEmail: "kim123@gmail.com",
    //         memberPassword: "kim123!@#",
    //         memberName: "김철수",
    //         memberAge: 25,
    //         memberAddress: "서울시 마포",
    //     },
    //     {
    //         memberEmail: "lee123@gmail.com",
    //         memberPassword: "lee123!@#",
    //         memberName: "이영희",
    //         memberAge: 30,
    //         memberAddress: "부산시 해운대",
    //     },
    //     {
    //         memberEmail: "park123@gmail.com",
    //         memberPassword: "park123!@#",
    //         memberName: "박민수",
    //         memberAge: 28,
    //         memberAddress: "인천시 연수",
    //     },
    //     { memberEmail: "choi123@gmail.com", memberPassword: "choi123!@#", memberName: "최지우", memberAge: 22, memberAddress: "서울시 송파" },
    //     { memberEmail: "jung123@gmail.com", memberPassword: "jung123!@#", memberName: "정우성", memberAge: 35, memberAddress: "대구시 수성" },
    //     { memberEmail: "kang123@gmail.com", memberPassword: "kang123!@#", memberName: "강하늘", memberAge: 27, memberAddress: "광주시 북구" },
    //     { memberEmail: "cho123@gmail.com", memberPassword: "cho123!@#", memberName: "조민아", memberAge: 24, memberAddress: "대전시 유성" },
    //     { memberEmail: "yoon123@gmail.com", memberPassword: "yoon123!@#", memberName: "윤서준", memberAge: 31, memberAddress: "울산시 남구" },
    //     { memberEmail: "jang123@gmail.com", memberPassword: "jang123!@#", memberName: "장나라", memberAge: 29, memberAddress: "수원시 영통" },
    //     { memberEmail: "lim123@gmail.com", memberPassword: "lim123!@#", memberName: "임시완", memberAge: 33, memberAddress: "성남시 분당" },
    //     { memberEmail: "han123@gmail.com", memberPassword: "han123!@#", memberName: "한지민", memberAge: 26, memberAddress: "고양시 일산" },
    //     { memberEmail: "oh123@gmail.com", memberPassword: "oh123!@#", memberName: "오세훈", memberAge: 40, memberAddress: "서울시 종로" },
    //     { memberEmail: "seo123@gmail.com", memberPassword: "seo123!@#", memberName: "서지혜", memberAge: 23, memberAddress: "용인시 수지" },
    //     { memberEmail: "shin123@gmail.com", memberPassword: "shin123!@#", memberName: "신동엽", memberAge: 38, memberAddress: "부천시 원미" },
    //     { memberEmail: "kwon123@gmail.com", memberPassword: "kwon123!@#", memberName: "권유리", memberAge: 21, memberAddress: "안양시 동안" },
    //     { memberEmail: "hwang123@gmail.com", memberPassword: "hwang123!@#", memberName: "황정민", memberAge: 45, memberAddress: "청주시 흥덕" },
    //     { memberEmail: "ahn123@gmail.com", memberPassword: "ahn123!@#", memberName: "안보현", memberAge: 32, memberAddress: "천안시 서북" },
    //     { memberEmail: "song123@gmail.com", memberPassword: "song123!@#", memberName: "송혜교", memberAge: 34, memberAddress: "전주시 완산" },
    //     { memberEmail: "yoo123@gmail.com", memberPassword: "yoo123!@#", memberName: "유재석", memberAge: 50, memberAddress: "서울시 서초" },
    //     { memberEmail: "hong123@gmail.com", memberPassword: "hong123!@#", memberName: "홍수아", memberAge: 28, memberAddress: "제주시 연동" },
    //     { memberEmail: "jeon123@gmail.com", memberPassword: "jeon123!@#", memberName: "전지현", memberAge: 37, memberAddress: "창원시 성산" },
    //     { memberEmail: "go123@gmail.com", memberPassword: "go123!@#", memberName: "고수", memberAge: 41, memberAddress: "포항시 남구" },
    //     { memberEmail: "moon123@gmail.com", memberPassword: "moon123!@#", memberName: "문채원", memberAge: 25, memberAddress: "김해시 내외" },
    // ]

    // const createdMembers = await prisma.member.createMany({
    //     data: members,
    //     skipDuplicates: true, // memberEmail(@unique) 중복 시 해당 데이터는 건너뜀
    // })

    // console.log(createdMembers) // { count: 23 }

    // 데이터 조회 (단건)
    // .findUnique() : @id 또는 @unique 필드로만 조회 가능
    // const foundMember = await prisma.member.findUnique({
    //     where: { id: 3 }
    // })

    // console.log(foundMember) // 없으면 null

    // 데이터 조회 (전체)
    // .findMany() : 조건 없이 호출하면 전체 조회, 결과는 배열
    // 페이지네이션 : skip(건너뛸 개수), take(가져올 개수)
    // const page = 2      // 조회할 페이지 번호 (1부터 시작)
    // const perPage = 5   // 페이지당 회원 수

    // const members = await prisma.member.findMany({
    //     skip: (page - 1) * perPage,
    //     take: perPage,
    //     orderBy: { id: "asc" }, // 정렬 기준이 있어야 페이지별 결과가 일정함
    // })

    // console.log(members) // 없으면 []

    // 데이터 수정
    // .update() : where는 @id 또는 @unique 필드로만 지정 가능
    // const updatedMember = await prisma.member.update({
    //     where: { id: 3 },
    //     data: { memberName: "강철수" }
    // })

    // console.log(updatedMember) // 수정된 회원 정보

    // 데이터 삭제
    // .delete() : where는 @id 또는 @unique 필드로만 지정 가능
    // const deletedMember = await prisma.member.delete({
    //     where: { id: 15 }
    // })

    // console.log(deletedMember) // 삭제된 회원 정보

    // 조건 조회
    // gte(>=), gt(>), lte(<=), lt(<)
    // const thirtiesMembers = await prisma.member.findMany({
    //     where: {
    //         memberAge: {
    //             gte: 30, // 30 이상
    //             lt: 40,  // 40 미만
    //         }
    //     },
    //     orderBy: { memberAge: "asc" },
    // })

    // console.log(thirtiesMembers) // 30대 회원 배열, 없으면 []

    // 문자열 조건 조회
    // startsWith(~로 시작), endsWith(~로 끝남), contains(~를 포함) → SQL의 LIKE
    // const seoulMembers = await prisma.member.findMany({
    //     where: {
    //         memberAddress: {
    //             startsWith: "서울", // LIKE '서울%'
    //         }
    //     },
    // })

    // console.log(seoulMembers) // 서울 거주 회원 배열, 없으면 []

    // 성씨로 조회 : 이름이 "홍"으로 시작
    // const hongMembers = await prisma.member.findMany({
    //     where: {
    //         memberName: {
    //             startsWith: "홍", // LIKE '홍%'
    //         }
    //     },
    // })

    // console.log(hongMembers) // 홍씨 회원 배열, 없으면 []

    

})()