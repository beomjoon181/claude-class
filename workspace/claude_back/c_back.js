import express from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client"
import swaggerUi from "swagger-ui-express"

const app = express()
const prisma = new PrismaClient()
// http://localhost:10000
const port = 10000

// 다른 출처(ex. Live Server)에서 열어도 요청할 수 있도록 허용
app.use(cors())
// fetch로 보내는 JSON 데이터를 req.body로 파싱
app.use(express.json())

app.listen(port, () => {
    console.log("서버 실행")
})

// swagger 문서 → http://localhost:10000/docs
const idParam = { name: "id", in: "path", required: true, schema: { type: "integer" } }
const errorRes = (description) => ({
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
})
const memberRes = (description) => ({
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Member" } } },
})
const boardRes = (description) => ({
    description,
    content: { "application/json": { schema: { $ref: "#/components/schemas/Board" } } },
})

const swaggerSpec = {
    openapi: "3.0.0",
    info: { title: "회원 · 게시판 API", version: "1.0.0", description: "Prisma로 tbl_member, tbl_board 테이블을 CRUD하는 API" },
    servers: [{ url: `http://localhost:${port}` }],
    components: {
        schemas: {
            // 응답용 (비밀번호 제외)
            Member: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    email: { type: "string", example: "a@test.com" },
                    name: { type: "string", nullable: true, example: "홍길동" },
                    age: { type: "integer", nullable: true, example: 25 },
                    address: { type: "string", nullable: true, example: "서울시 강남구" },
                    phone: { type: "string", example: "010-1234-5678" },
                },
            },
            // 추가용 (email, password, phone 필수)
            MemberCreate: {
                type: "object",
                required: ["email", "password", "phone"],
                properties: {
                    email: { type: "string", example: "a@test.com" },
                    password: { type: "string", example: "1234" },
                    name: { type: "string", example: "홍길동" },
                    age: { type: "integer", example: 25 },
                    address: { type: "string", example: "서울시 강남구" },
                    phone: { type: "string", example: "010-1234-5678" },
                },
            },
            // 수정용 (보낸 값만 변경)
            MemberUpdate: {
                type: "object",
                properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    name: { type: "string" },
                    age: { type: "integer" },
                    address: { type: "string" },
                    phone: { type: "string" },
                },
                example: { name: "김철수", age: 30 },
            },
            // 응답용 (작성자 정보 포함)
            Board: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 1 },
                    boardTitle: { type: "string", example: "첫 번째 글" },
                    boardContent: { type: "string", example: "안녕하세요. 게시글 내용입니다." },
                    boardIsOpen: { type: "boolean", example: true },
                    boardCheckedAt: { type: "string", format: "date-time", example: "2026-10-26T12:00:00.000Z" },
                    memberId: { type: "integer", example: 1 },
                    member: {
                        type: "object",
                        properties: {
                            id: { type: "integer", example: 1 },
                            email: { type: "string", example: "a@test.com" },
                            name: { type: "string", nullable: true, example: "홍길동" },
                        },
                    },
                },
            },
            // 작성용 (제목, 내용, 작성자 필수 / 공개여부 기본 true)
            BoardCreate: {
                type: "object",
                required: ["boardTitle", "boardContent", "memberId"],
                properties: {
                    boardTitle: { type: "string", example: "첫 번째 글" },
                    boardContent: { type: "string", example: "안녕하세요. 게시글 내용입니다." },
                    boardIsOpen: { type: "boolean", example: true },
                    memberId: { type: "integer", example: 1 },
                },
            },
            // 수정용 (보낸 값만 변경)
            BoardUpdate: {
                type: "object",
                properties: {
                    boardTitle: { type: "string" },
                    boardContent: { type: "string" },
                    boardIsOpen: { type: "boolean" },
                },
                example: { boardTitle: "제목 수정", boardIsOpen: false },
            },
            Error: {
                type: "object",
                properties: { message: { type: "string" } },
            },
        },
    },
    paths: {
        "/login": {
            post: {
                tags: ["Auth"],
                summary: "로그인",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", example: "user1@test.com" },
                                    password: { type: "string", example: "1234" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: memberRes("로그인한 회원"),
                    401: errorRes("이메일 또는 비밀번호 불일치"),
                },
            },
        },
        "/member": {
            get: {
                tags: ["Member"],
                summary: "목록 조회",
                responses: {
                    200: {
                        description: "회원 목록",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { $ref: "#/components/schemas/Member" } },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Member"],
                summary: "추가 (회원가입)",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/MemberCreate" } } },
                },
                responses: {
                    201: memberRes("추가된 회원"),
                    400: errorRes("필수 값 누락"),
                    409: errorRes("이메일 중복"),
                },
            },
        },
        "/member/{id}": {
            get: {
                tags: ["Member"],
                summary: "한 명 조회",
                parameters: [idParam],
                responses: {
                    200: memberRes("회원 정보"),
                    404: errorRes("없는 회원"),
                },
            },
            patch: {
                tags: ["Member"],
                summary: "수정 (보낸 값만 변경)",
                parameters: [idParam],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/MemberUpdate" } } },
                },
                responses: {
                    200: memberRes("수정된 회원"),
                    404: errorRes("없는 회원"),
                    409: errorRes("이메일 중복"),
                },
            },
            delete: {
                tags: ["Member"],
                summary: "삭제",
                parameters: [idParam],
                responses: {
                    200: {
                        description: "삭제된 회원 id",
                        content: {
                            "application/json": {
                                schema: { type: "object", properties: { id: { type: "integer", example: 1 } } },
                            },
                        },
                    },
                    404: errorRes("없는 회원"),
                },
            },
        },
        "/board": {
            get: {
                tags: ["Board"],
                summary: "목록 조회 (최신순)",
                description: "memberId가 없으면 공개글만, 있으면 그 회원의 글을 비공개 포함 전부 조회",
                parameters: [{ name: "memberId", in: "query", required: false, schema: { type: "integer" } }],
                responses: {
                    200: {
                        description: "게시글 목록",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { $ref: "#/components/schemas/Board" } },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Board"],
                summary: "작성",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/BoardCreate" } } },
                },
                responses: {
                    201: boardRes("작성된 게시글"),
                    400: errorRes("필수 값 누락"),
                    404: errorRes("없는 회원"),
                },
            },
        },
        "/board/{id}": {
            get: {
                tags: ["Board"],
                summary: "하나 조회",
                parameters: [idParam],
                responses: {
                    200: boardRes("게시글"),
                    404: errorRes("없는 게시글"),
                },
            },
            patch: {
                tags: ["Board"],
                summary: "수정 (보낸 값만 변경)",
                parameters: [idParam],
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { $ref: "#/components/schemas/BoardUpdate" } } },
                },
                responses: {
                    200: boardRes("수정된 게시글"),
                    400: errorRes("제목 또는 내용을 빈 값으로 수정"),
                    404: errorRes("없는 게시글"),
                },
            },
            delete: {
                tags: ["Board"],
                summary: "삭제",
                parameters: [idParam],
                responses: {
                    200: {
                        description: "삭제된 게시글 id",
                        content: {
                            "application/json": {
                                schema: { type: "object", properties: { id: { type: "integer", example: 1 } } },
                            },
                        },
                    },
                    404: errorRes("없는 게시글"),
                },
            },
        },
    },
}

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 응답에서 비밀번호는 빼고 보내기
const omit = { password: true }

// 화면 보내기 → http://localhost:10000
app.get("/", (_, res) => {
    res.sendFile(import.meta.dirname + "/mypage.html")
})
app.get("/mypage.js", (_, res) => {
    res.sendFile(import.meta.dirname + "/mypage.js")
})
// 게시판 화면 → http://localhost:10000/board.html
app.get("/board.html", (_, res) => {
    res.sendFile(import.meta.dirname + "/board.html")
})
app.get("/board.js", (_, res) => {
    res.sendFile(import.meta.dirname + "/board.js")
})

// 로그인 (이메일 + 비밀번호 확인)
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    console.log("로그인:", email)

    const member = await prisma.member.findUnique({ where: { email: email ?? "" } })
    if (!member || member.password !== password) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." })
    }

    const { password: _, ...rest } = member
    res.json(rest)
})

// 목록 조회
app.get("/member", async (_, res) => {
    const members = await prisma.member.findMany({ omit })
    res.json(members)
})

// 한 명 조회
app.get("/member/:id", async (req, res) => {
    const member = await prisma.member.findUnique({
        where: { id: Number(req.params.id) },
        omit,
    })
    if (!member) return res.status(404).json({ message: "없는 회원" })

    res.json(member)
})

// 추가 (회원가입)
app.post("/member", async (req, res) => {
    const { email, password, name, age, address, phone } = req.body //페이로드
    console.log("추가:", email)

    // 필수 값 확인
    if (!email || !password || !phone) {
        return res.status(400).json({ message: "이메일, 비밀번호, 휴대폰 번호는 필수" })
    }

    try {
        const member = await prisma.member.create({
            data: { email, password, name, age, address, phone },
            omit,
        })
        res.status(201).json(member)
    } catch (e) {
        // P2002: unique 제약 위반 (이메일 중복)
        if (e.code === "P2002") return res.status(409).json({ message: "이미 사용 중인 이메일" })
        res.status(500).json({ message: "서버 오류" })
    }
})

// 수정 (보낸 값만 변경)
app.patch("/member/:id", async (req, res) => {
    const { email, password, name, age, address, phone } = req.body
    console.log("수정:", req.params.id)

    try {
        const member = await prisma.member.update({
            where: { id: Number(req.params.id) },
            // undefined인 값은 Prisma가 무시하므로 보낸 값만 수정됨
            data: { email, password, name, age, address, phone },
            omit,
        })
        res.json(member)
    } catch (e) {
        // P2025: 수정할 데이터가 없음
        if (e.code === "P2025") return res.status(404).json({ message: "없는 회원" })
        if (e.code === "P2002") return res.status(409).json({ message: "이미 사용 중인 이메일" })
        res.status(500).json({ message: "서버 오류" })
    }
})

// 삭제
app.delete("/member/:id", async (req, res) => {
    const id = Number(req.params.id)
    console.log("삭제:", id)

    try {
        await prisma.member.delete({ where: { id } })
        res.json({ id })
    } catch (e) {
        if (e.code === "P2025") return res.status(404).json({ message: "없는 회원" })
        res.status(500).json({ message: "서버 오류" })
    }
})

// ---------- 게시판 ----------

// 게시글과 함께 보낼 작성자 정보 (비밀번호 등은 제외)
const include = { member: { select: { id: true, email: true, name: true } } }

// 목록 조회 (최신순)
// /board → 공개글만, /board?memberId=1 → 그 회원의 글 전부 (비공개 포함)
app.get("/board", async (req, res) => {
    const { memberId } = req.query
    const where = memberId ? { memberId: Number(memberId) } : { boardIsOpen: true }

    const boards = await prisma.board.findMany({
        where,
        include,
        orderBy: { boardCheckedAt: "desc" },
    })
    res.json(boards)
})

// 하나 조회
app.get("/board/:id", async (req, res) => {
    const board = await prisma.board.findUnique({
        where: { id: Number(req.params.id) },
        include,
    })
    if (!board) return res.status(404).json({ message: "없는 게시글" })

    res.json(board)
})

// 작성 (boardIsOpen은 안 보내면 true, boardCheckedAt은 DB가 자동 기입)
app.post("/board", async (req, res) => {
    const { boardTitle, boardContent, boardIsOpen, memberId } = req.body //페이로드
    console.log("글 작성:", boardTitle)

    // 필수 값 확인
    if (!boardTitle || !boardContent || !memberId) {
        return res.status(400).json({ message: "제목, 내용, 작성자는 필수" })
    }

    try {
        const board = await prisma.board.create({
            data: { boardTitle, boardContent, boardIsOpen, memberId: Number(memberId) },
            include,
        })
        res.status(201).json(board)
    } catch (e) {
        // P2003: 외래키 제약 위반 (없는 회원 id)
        if (e.code === "P2003") return res.status(404).json({ message: "없는 회원" })
        res.status(500).json({ message: "서버 오류" })
    }
})

// 수정 (보낸 값만 변경)
app.patch("/board/:id", async (req, res) => {
    const { boardTitle, boardContent, boardIsOpen } = req.body
    console.log("글 수정:", req.params.id)

    // 제목, 내용은 필수 컬럼이라 빈 값으로 바꿀 수 없음
    if (boardTitle === "" || boardContent === "") {
        return res.status(400).json({ message: "제목과 내용은 비울 수 없음" })
    }

    try {
        const board = await prisma.board.update({
            where: { id: Number(req.params.id) },
            data: { boardTitle, boardContent, boardIsOpen },
            include,
        })
        res.json(board)
    } catch (e) {
        if (e.code === "P2025") return res.status(404).json({ message: "없는 게시글" })
        res.status(500).json({ message: "서버 오류" })
    }
})

// 삭제
app.delete("/board/:id", async (req, res) => {
    const id = Number(req.params.id)
    console.log("글 삭제:", id)

    try {
        await prisma.board.delete({ where: { id } })
        res.json({ id })
    } catch (e) {
        if (e.code === "P2025") return res.status(404).json({ message: "없는 게시글" })
        res.status(500).json({ message: "서버 오류" })
    }
})
