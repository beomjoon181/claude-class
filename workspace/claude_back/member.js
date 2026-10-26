import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// 더미 데이터 재료
const lastNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]
const firstNames = ["민준", "서연", "도윤", "지우", "하준", "서윤", "시우", "하은", "지호", "수아"]
const cities = ["서울시 강남구", "서울시 마포구", "부산시 해운대구", "대구시 수성구", "인천시 연수구", "광주시 서구", "대전시 유성구", "수원시 영통구"]

// min ~ max 사이 랜덤 정수
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
// 배열에서 랜덤으로 하나 고르기
const pick = (arr) => arr[random(0, arr.length - 1)]
// 4자리 숫자 문자열 (앞자리 0 유지)
const fourDigits = () => String(random(0, 9999)).padStart(4, "0")

// 즉시 실행 함수 → node member.js
;(async () => {
    try {
        const members = Array.from({ length: 100 }, (_, i) => ({
            email: `user${i + 1}@test.com`,
            password: "1234",
            name: pick(lastNames) + pick(firstNames),
            age: random(20, 60),
            address: `${pick(cities)} ${random(1, 200)}번길 ${random(1, 50)}`,
            phone: `010-${fourDigits()}-${fourDigits()}`,
        }))

        // skipDuplicates: 이미 있는 이메일은 건너뜀 (여러 번 실행해도 에러 안 남)
        const result = await prisma.member.createMany({ data: members, skipDuplicates: true })
        console.log(`${result.count}명 추가 완료`)
    } catch (e) {
        console.error("추가 실패:", e)
    } finally {
        await prisma.$disconnect()
    }
})()
