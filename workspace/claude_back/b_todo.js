import express from "express"
import cors from "cors"

const app = express()
// http://localhost:10000
const port = 10000

// 다른 출처(ex. Live Server)에서 열어도 요청할 수 있도록 허용
app.use(cors())
// fetch로 보내는 JSON 데이터를 req.body로 파싱
app.use(express.json())

app.listen(port, () => {
    console.log("서버 실행")
})

// 데이터베이스 대신 사용하는 임시 데이터 (서버를 재시작하면 초기화됨)
let todos = [
    { id: 1, text: "Express 복습하기", done: true },
    { id: 2, text: "할 일 목록 만들기", done: false },
]
let nextId = 3

// 화면 보내기 → http://localhost:10000
app.get("/", (_, res) => {
    res.sendFile(import.meta.dirname + "/b_todo.html")
})

// 목록 조회
app.get("/todo", (_, res) => {
    res.json(todos)
})

// 추가
app.post("/todo", (req, res) => {
    const { text } = req.body //페이로드
    console.log("추가:", text)

    const todo = { id: nextId++, text, done: false }
    todos.push(todo)
    res.json(todo)
})

// 수정 (내용 변경 또는 완료 여부 변경)
app.patch("/todo/:id", (req, res) => {
    const todo = todos.find((t) => t.id === Number(req.params.id))
    if (!todo) return res.status(404).json({ message: "없는 할 일" })

    const { text, done } = req.body
    if (text !== undefined) todo.text = text
    if (done !== undefined) todo.done = done
    console.log("수정:", todo)

    res.json(todo)
})

// 삭제
app.delete("/todo/:id", (req, res) => {
    const id = Number(req.params.id)
    console.log("삭제:", id)

    todos = todos.filter((t) => t.id !== id)
    res.json({ id })
})
