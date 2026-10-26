// c_back.js 서버 주소
const API = "http://localhost:10000"
// mypage.js가 로그인한 회원 id를 저장하는 키
const LOGIN_KEY = "member-login-id"
// 한 페이지에 보여줄 글 수
const PER = 10
const COLORS = ["#5cc93b", "#ff6b5b", "#4aa3f0", "#ffc233", "#9b7bf0"]

const $ = (sel) => document.querySelector(sel)
const views = { list: $("#listView"), view: $("#detailView"), form: $("#formView") }
const searchForm = $("#searchForm")
const postForm = $("#postForm")

let me = null // 로그인한 회원 (없으면 null)
let posts = [] // 공개글 목록 (최신순)
let cur = null // 지금 보고 있는 글
let editing = false // 작성 / 수정 구분
let search = { query: "", field: "all" }
let page = 1

// ---------- 공통 ----------

// 서버 요청 (실패하면 status와 message를 담아 에러로 던짐)
async function request(path, method = "GET", body) {
    const res = await fetch(API + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, message: data.message }
    return data
}

// 사용자가 쓴 글을 innerHTML에 넣기 전에 태그 무력화
const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

const fmtDate = (iso) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
}
// 이름이 없으면 이메일 앞부분을 작성자 이름으로 사용
const authorName = (m) => m.name || m.email.split("@")[0]
const avatarColor = (memberId) => COLORS[memberId % COLORS.length]
const isMine = (post) => me && post.memberId === me.id

let toastTimer
function toast(text) {
    const el = $("#toast")
    el.textContent = text
    el.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (el.hidden = true), 2000)
}

function show(name) {
    for (const key in views) views[key].hidden = key !== name
    window.scrollTo({ top: 0 })
}

// ---------- 목록 ----------

async function loadPosts() {
    posts = await request("/board")
}

function filtered() {
    const q = search.query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
        (p) =>
            (search.field !== "content" && p.boardTitle.toLowerCase().includes(q)) ||
            (search.field !== "title" && p.boardContent.toLowerCase().includes(q))
    )
}

function renderList() {
    const list = filtered()
    const totalPages = Math.max(1, Math.ceil(list.length / PER))
    page = Math.min(page, totalPages)

    $("#totalCount").textContent = list.length
    $("#clearSearch").hidden = !search.query.trim()

    // 빈 화면 (글이 아예 없을 때 / 검색 결과가 없을 때)
    $("#empty").hidden = list.length > 0
    if (!list.length) {
        $("#emptyTitle").textContent = search.query.trim()
            ? `‘${search.query}’에 대한 검색 결과가 없어요`
            : "아직 작성된 글이 없어요"
        $("#emptyDesc").textContent = search.query.trim() ? "다른 검색어로 다시 찾아보세요." : "첫 번째 글을 남겨 보세요."
    }

    $("#grid").innerHTML = list
        .slice((page - 1) * PER, page * PER)
        .map(
            (p) => `
            <article class="card" data-id="${p.id}">
                <span class="card-tag">[${p.boardIsOpen ? "공개" : "비공개"}] No.${p.id}</span>
                <h3>${escape(p.boardTitle)}</h3>
                <p>${escape(p.boardContent.replace(/\n/g, " "))}</p>
                <div class="card-foot">
                    <span class="card-author">${escape(authorName(p.member))}</span>
                    <span class="card-date">${fmtDate(p.boardCheckedAt)}</span>
                </div>
                <span class="avatar" style="background:${avatarColor(p.memberId)}">${escape(authorName(p.member)[0])}</span>
            </article>`
        )
        .join("")

    renderPager(list.length, totalPages)
}

// 페이지 번호는 5개씩 묶어서 표시
function renderPager(count, totalPages) {
    const pager = $("#pager")
    pager.hidden = count === 0
    const start = Math.floor((page - 1) / 5) * 5 + 1
    const end = Math.min(totalPages, start + 4)

    let html = `
        <button class="arrow" data-page="1" ${page === 1 ? "disabled" : ""}>«</button>
        <button class="arrow" data-page="${page - 1}" ${page === 1 ? "disabled" : ""}>‹</button>`
    for (let n = start; n <= end; n++) {
        html += `<button data-page="${n}" class="${n === page ? "active" : ""}">${n}</button>`
    }
    html += `
        <button class="arrow" data-page="${page + 1}" ${page === totalPages ? "disabled" : ""}>›</button>
        <button class="arrow" data-page="${totalPages}" ${page === totalPages ? "disabled" : ""}>»</button>`
    pager.innerHTML = html
}

async function openList() {
    try {
        await loadPosts()
    } catch {
        toast("서버에 연결할 수 없어요")
    }
    renderList()
    show("list")
}

// ---------- 조회 ----------

async function openView(id) {
    try {
        cur = await request(`/board/${id}`)
    } catch (err) {
        return toast(err.message || "서버에 연결할 수 없어요")
    }
    // 비공개 글은 작성자 본인만 볼 수 있음
    if (!cur.boardIsOpen && !isMine(cur)) return toast("비공개 글이에요")

    const badge = $("#vBadge")
    badge.textContent = cur.boardIsOpen ? "공개" : "비공개"
    badge.classList.toggle("closed", !cur.boardIsOpen)
    $("#vTitle").textContent = cur.boardTitle
    $("#vAvatar").textContent = authorName(cur.member)[0]
    $("#vAvatar").style.background = avatarColor(cur.memberId)
    $("#vAuthor").textContent = authorName(cur.member)
    $("#vDate").textContent = fmtDate(cur.boardCheckedAt)
    $("#vContent").textContent = cur.boardContent
    $("#ownerBtns").hidden = !isMine(cur)

    // 이전글(더 오래된 글) / 다음글(더 최근 글) - 공개글 목록 기준
    const idx = posts.findIndex((p) => p.id === cur.id)
    const older = idx >= 0 ? posts[idx + 1] : null
    const newer = idx > 0 ? posts[idx - 1] : null
    setNear("#prevBtn", "#prevTitle", older)
    setNear("#nextBtn", "#nextTitle", newer)

    show("view")
}

function setNear(btnSel, titleSel, post) {
    $(btnSel).hidden = !post
    $(btnSel).dataset.id = post ? post.id : ""
    $(titleSel).textContent = post ? post.boardTitle : ""
}

// ---------- 작성 / 수정 ----------

function openForm(post) {
    // 글쓰기는 로그인한 회원만 가능
    if (!me) {
        toast("로그인이 필요해요. 로그인 화면으로 이동합니다.")
        return setTimeout(() => (location.href = "/"), 1200)
    }

    editing = !!post
    const title = editing ? "게시글 수정" : "게시글 작성"
    $("#formTitle").textContent = title
    $("#formCrumb").textContent = title
    $("#submitBtn").textContent = editing ? "수정 완료" : "등록하기"

    postForm.reset()
    postForm.querySelectorAll("[data-err]").forEach((el) => (el.textContent = ""))
    postForm.author.value = authorName(me)
    if (editing) {
        postForm.boardIsOpen.value = String(post.boardIsOpen)
        postForm.boardTitle.value = post.boardTitle
        postForm.boardContent.value = post.boardContent
    }
    $("#contentLen").textContent = postForm.boardContent.value.length
    show("form")
}

postForm.addEventListener("input", (e) => {
    if (e.target.name === "boardContent") $("#contentLen").textContent = e.target.value.length
    const err = postForm.querySelector(`[data-err="${e.target.name}"]`)
    if (err) err.textContent = ""
})

postForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const body = {
        boardTitle: postForm.boardTitle.value.trim(),
        boardContent: postForm.boardContent.value.trim(),
        boardIsOpen: postForm.boardIsOpen.value === "true",
    }

    const errors = {}
    if (!body.boardTitle) errors.boardTitle = "제목을 입력해 주세요."
    if (body.boardContent.length < 5) errors.boardContent = "내용을 5자 이상 입력해 주세요."
    if (Object.keys(errors).length) {
        postForm.querySelectorAll("[data-err]").forEach((el) => (el.textContent = errors[el.dataset.err] || ""))
        return
    }

    try {
        const saved = editing
            ? await request(`/board/${cur.id}`, "PATCH", body)
            : await request("/board", "POST", { ...body, memberId: me.id })
        await loadPosts()
        await openView(saved.id)
        toast(editing ? "수정되었어요" : "게시글이 등록되었어요")
    } catch (err) {
        toast(err.message || "서버에 연결할 수 없어요")
    }
})

$("#cancelBtn").addEventListener("click", () => (editing ? openView(cur.id) : openList()))

// ---------- 이벤트 ----------

$("#brand").addEventListener("click", openList)
document.querySelectorAll("[data-action]").forEach((el) =>
    el.addEventListener("click", () => (el.dataset.action === "write" ? openForm(null) : openList()))
)

// 검색
searchForm.addEventListener("submit", (e) => {
    e.preventDefault()
    search = { query: searchForm.query.value, field: searchForm.field.value }
    page = 1
    renderList()
})
$("#clearSearch").addEventListener("click", () => {
    searchForm.query.value = ""
    search = { query: "", field: "all" }
    page = 1
    renderList()
})

// 카드 클릭 → 조회
$("#grid").addEventListener("click", (e) => {
    const card = e.target.closest(".card")
    if (card) openView(Number(card.dataset.id))
})

// 페이지 이동
$("#pager").addEventListener("click", (e) => {
    const btn = e.target.closest("button")
    if (!btn || btn.disabled) return
    page = Number(btn.dataset.page)
    renderList()
    window.scrollTo({ top: 0 })
})

// 이전글 / 다음글
for (const sel of ["#prevBtn", "#nextBtn"]) {
    $(sel).addEventListener("click", (e) => openView(Number(e.currentTarget.dataset.id)))
}

// 수정
$("#editBtn").addEventListener("click", () => openForm(cur))

// 삭제
const modal = $("#deleteModal")
$("#deleteBtn").addEventListener("click", () => (modal.hidden = false))
$("#deleteCancelBtn").addEventListener("click", () => (modal.hidden = true))
// 바깥 어두운 영역 클릭 시 닫기
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true
})
$("#deleteOkBtn").addEventListener("click", async () => {
    try {
        await request(`/board/${cur.id}`, "DELETE")
        modal.hidden = true
        await openList()
        toast("게시글이 삭제되었어요")
    } catch (err) {
        toast(err.message || "서버에 연결할 수 없어요")
    }
})

// ---------- 시작 ----------

;(async () => {
    // mypage에서 로그인한 정보가 있으면 회원 정보 불러오기
    const id = localStorage.getItem(LOGIN_KEY) || sessionStorage.getItem(LOGIN_KEY)
    if (id) {
        try {
            me = await request(`/member/${id}`)
        } catch {
            me = null
        }
    }
    $("#who").innerHTML = me ? `${escape(authorName(me))} 님` : `<a href="/">로그인</a>`

    await openList()
})()
