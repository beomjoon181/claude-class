import express from "express"

const app = express()
// http://localhost:10000
const port = 10000

// form 태그의 post 데이터(x-www-form-urlencoded)를 req.body로 파싱
app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
    console.log("서버 실행")
})

app.get("/", (_, res) => {
    res.set({"Content-Type": "text/html; charset=utf-8"})
    res.end("<h1>Hello, World!😎</h1>")
})

// a_intro.html 폼 데이터 받기 (get 방식 → 쿼리스트링)
app.get("/user", (req, res) => {
    const { email, password, name } = req.query
    console.log("email:", email)
    console.log("password:", password)
    console.log("name:", name)

    res.set({"Content-Type": "text/html; charset=utf-8"})
    res.end("<h1>데이터 수신 완료</h1>")
})

// a_intro.html 폼 데이터 받기 (post 방식 → 요청 본문)
app.post("/user", (req, res) => {
    const { email, password, name } = req.body //페이로드
    console.log("email:", email)
    console.log("password:", password)
    console.log("name:", name)

    res.set({"Content-Type": "text/html; charset=utf-8"})
    res.end("<h1>데이터 수신 완료</h1>")
})