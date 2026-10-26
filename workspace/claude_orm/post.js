import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

(async () => {
    // 랜덤 회원이 게시글 100개 작성
    // .createMany()
    // const members = await prisma.member.findMany({
    //     select: { id: true } // 작성자로 쓸 회원 id만 조회
    // })

    // if (members.length === 0) {
    //     console.log("회원이 없습니다. member.js로 회원을 먼저 추가하세요.")
    //     return
    // }

    // const titles = ["오늘의 일상", "맛집 추천", "여행 후기", "질문 있습니다", "공부 기록", "운동 일지", "영화 리뷰", "책 추천", "개발 이야기", "자유 잡담"]
    // const contents = [
    //     "오늘 하루도 무사히 지나갔네요. 다들 좋은 하루 보내세요!",
    //     "이번 주말에 다녀온 곳인데 정말 좋았습니다.",
    //     "혹시 이 부분 아시는 분 계신가요? 답변 부탁드립니다.",
    //     "꾸준히 하는 게 제일 어려운 것 같아요.",
    //     "생각보다 훨씬 재미있어서 추천드립니다.",
    // ]

    // const posts = []
    // for (let i = 1; i <= 100; i++) {
    //     const randomMember = members[Math.floor(Math.random() * members.length)] // 랜덤 작성자
    //     posts.push({
    //         postTitle: `${titles[Math.floor(Math.random() * titles.length)]} ${i}`,
    //         postContent: contents[Math.floor(Math.random() * contents.length)],
    //         memberId: randomMember.id,
    //     })
    // }

    // const createdPosts = await prisma.post.createMany({
    //     data: posts
    // })

    // console.log(createdPosts) // { count: 100 }

    // 게시글 + 작성자 조인 조회 (전체)
    // include : 관계 필드(member)를 함께 조회 → SQL의 JOIN
    // const posts = await prisma.post.findMany({
    //     include: {
    //         member: {
    //             select: { // 비밀번호는 제외하고 필요한 회원 정보만 조회
    //                 id: true,
    //                 memberEmail: true,
    //                 memberName: true,
    //             }
    //         }
    //     },
    //     orderBy: { id: "asc" },
    // })

    // console.log(posts) // 게시글 배열, 각 게시글에 member 객체 포함

    // 회원 + 작성한 게시글 조회 (단건)
    // select 안에서 관계 필드(posts)를 지정하면 해당 회원의 게시글 배열을 함께 조회
    // const member = await prisma.member.findUnique({
    //     where: { id: 3 },
    //     select: { // 비밀번호는 제외
    //         id: true,
    //         memberEmail: true,
    //         memberName: true,
    //         posts: {
    //             orderBy: { id: "asc" },
    //         },
    //     },
    // })

    // console.dir(member, { depth: null }) // 중첩된 posts 배열까지 전부 출력, 없으면 null

    // 1. 게시글 목록 (전체)
    // 아이디, 제목, 작성일, 작성자 이름
    // const posts = await prisma.post.findMany({
    //     select: {
    //         id: true,
    //         postTitle: true,
    //         postCreatedAt: true,
    //         member: { // join
    //             select: {
    //                 memberName: true,
    //             },
    //         },
    //     },
    //     orderBy: { id: "desc" }, // 최신 글이 위로
    // })

    // console.log(posts)

    // 2. 게시글 상세보기 (1번)
    // 멤버의 주소, 비밀번호, 가입일 제외
    // omit : 지정한 필드만 빼고 나머지 전부 조회
    const post = await prisma.post.findUnique({
        where: { id: 1 },
        include: {
            member: { // join
                omit: {
                    memberAddress: true,
                    memberPassword: true,
                    memberCreatedAt: true,
                },
            },
        },
    })

    console.log(post) // 없으면 null

})()
