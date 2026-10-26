import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 더미 데이터 재료
const topics = ["Express", "Prisma", "MySQL", "JavaScript", "HTML", "CSS", "Node.js", "Swagger", "REST API", "Git"]
const titleForms = [
    (t) => `${t} 공부 기록`,
    (t) => `${t} 질문 있습니다`,
    (t) => `${t} 처음 써 본 후기`,
    (t) => `${t} 에러 해결 방법 공유`,
    (t) => `오늘 배운 ${t} 정리`,
    (t) => `${t} 추천 자료 모음`,
]
const sentences = [
    "오늘 수업에서 배운 내용을 정리해 봤습니다.",
    "생각보다 어렵지 않아서 금방 따라 할 수 있었어요.",
    "처음에는 에러가 많이 났는데 공식 문서를 보고 해결했습니다.",
    "혹시 더 좋은 방법이 있으면 댓글로 알려 주세요.",
    "다음에는 실제 프로젝트에 적용해 볼 생각입니다.",
    "예제 코드를 직접 작성해 보니 이해가 훨씬 잘 됐어요.",
    "설정 파일을 잘못 써서 한참 헤맸습니다.",
    "같이 공부하실 분 있으면 연락 주세요.",
]

// min ~ max 사이 랜덤 정수
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
// 배열에서 랜덤으로 하나 고르기
const pick = (arr) => arr[random(0, arr.length - 1)]
// 최근 30일 안의 랜덤 시각
const randomDate = () => new Date(Date.now() - random(0, 30 * 24 * 60 * 60 * 1000))

// 즉시 실행 함수 → node post.js
;(async () => {
    try {
        // 작성자로 쓸 회원 id 목록 (memberId는 tbl_member의 외래키라 실제 있는 회원이어야 함)
        const members = await prisma.member.findMany({ select: { id: true } })
        if (members.length === 0) {
            console.log("회원이 없습니다. 먼저 node member.js로 회원을 추가하세요.")
            return
        }
        const memberIds = members.map((m) => m.id)

        const boards = Array.from({ length: 100 }, () => ({
            boardTitle: pick(titleForms)(pick(topics)),
            // 문장 2~4개를 이어 붙여 내용 만들기
            boardContent: Array.from({ length: random(2, 4) }, () => pick(sentences)).join(" "),
            // 80%는 공개, 20%는 비공개
            boardIsOpen: Math.random() < 0.8,
            // 실제 작성은 DB가 현재 시각을 넣지만, 최신순 정렬 확인을 위해 날짜를 흩어 놓음
            boardCheckedAt: randomDate(),
            memberId: pick(memberIds),
        }))

        const result = await prisma.board.createMany({ data: boards })
        console.log(`게시글 ${result.count}개 추가 완료`)
    } catch (e) {
        console.error("추가 실패:", e)
    } finally {
        await prisma.$disconnect()
    }
})()
