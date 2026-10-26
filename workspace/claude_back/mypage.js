// c_back.js 서버 주소
const API = "http://localhost:10000"
// 로그인한 회원 id를 저장하는 키 (상태 유지: localStorage, 아니면 sessionStorage)
const KEY = "member-login-id"

const $ = (sel) => document.querySelector(sel)
const screens = { login: $("#loginScreen"), signup: $("#signupScreen"), mypage: $("#mypageScreen") }
const loginForm = $("#loginForm")
const signupForm = $("#signupForm")
const editForm = $("#editForm")

let me = null // 로그인한 회원 정보

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

function show(name) {
    for (const key in screens) screens[key].hidden = key !== name
    // 화면 이동 시 입력값과 에러 초기화
    for (const form of [loginForm, signupForm]) form.reset()
    clearErrors(document)
    editMode(false)
}

function setErrors(form, errors) {
    form.querySelectorAll("[data-err]").forEach((el) => (el.textContent = errors[el.dataset.err] || ""))
}
function clearErrors(root) {
    root.querySelectorAll("[data-err]").forEach((el) => (el.textContent = ""))
}

let toastTimer
function toast(text) {
    const el = $("#toast")
    el.textContent = text
    el.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (el.hidden = true), 2200)
}

// 010-1234-5678 형식으로 자동 변환
function fmtPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length < 4) return d
    if (d.length < 8) return d.slice(0, 3) + "-" + d.slice(3)
    return d.slice(0, 3) + "-" + d.slice(3, d.length - 4) + "-" + d.slice(-4)
}

// 입력 중 자동 포맷 + 해당 칸 에러 지우기
document.addEventListener("input", (e) => {
    const input = e.target
    if (input.name === "phone") input.value = fmtPhone(input.value)
    if (input.name === "age") input.value = input.value.replace(/\D/g, "").slice(0, 3)
    const err = input.form?.querySelector(`[data-err="${input.name}"]`)
    if (err) err.textContent = ""
    const loginErr = input.form?.querySelector('[data-err="login"]')
    if (loginErr) loginErr.textContent = ""
})

// 회원가입/수정 입력값 검사
function validate(f, mode) {
    const e = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "올바른 이메일 형식이 아닙니다."
    if ((mode === "signup" || f.password) && f.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다."
    if (mode === "signup" && f.password !== f.password2) e.password2 = "비밀번호가 일치하지 않습니다."
    if (f.age && (+f.age < 1 || +f.age > 150)) e.age = "나이를 확인해 주세요."
    if (!/^01\d-\d{3,4}-\d{4}$/.test(f.phone)) e.phone = "휴대폰 번호를 정확히 입력해 주세요."
    return e
}

// 폼 값 → 서버로 보낼 데이터 (빈 값은 null, 나이는 숫자)
function toBody(f) {
    return {
        email: f.email.trim(),
        name: f.name.trim() || null,
        age: f.age ? Number(f.age) : null,
        address: f.address.trim() || null,
        phone: f.phone,
    }
}

const formData = (form) => Object.fromEntries(new FormData(form))

// ---------- 로그인 상태 ----------

function saveLogin(id, keep) {
    ;(keep ? localStorage : sessionStorage).setItem(KEY, id)
}
function clearLogin() {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
}
function savedLoginId() {
    return localStorage.getItem(KEY) || sessionStorage.getItem(KEY)
}

// ---------- 마이페이지 ----------

function renderMe() {
    const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v)
    $("#meInitial").textContent = (me.name || me.email)[0].toUpperCase()
    $("#meTitle").textContent = me.name ? me.name + " 님" : "회원님"
    $("#meEmail").textContent = me.email

    const values = {
        no: String(me.id).padStart(4, "0"),
        email: me.email,
        name: dash(me.name),
        age: me.age ? me.age + "세" : "—",
        phone: me.phone,
        address: dash(me.address),
    }
    document.querySelectorAll("[data-me]").forEach((el) => (el.textContent = values[el.dataset.me]))
}

function openMypage(member) {
    me = member
    renderMe()
    show("mypage")
}

function editMode(on) {
    $("#viewBox").hidden = on
    editForm.hidden = !on
    clearErrors(editForm)
    if (on) {
        editForm.reset()
        editForm.email.value = me.email
        editForm.name.value = me.name || ""
        editForm.age.value = me.age ?? ""
        editForm.phone.value = me.phone
        editForm.address.value = me.address || ""
    }
}

// ---------- 이벤트 ----------

$("#logo").addEventListener("click", () => show(me ? "mypage" : "login"))
document.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => show(el.dataset.go)))

// 로그인
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const f = formData(loginForm)
    if (!f.email || !f.password) return setErrors(loginForm, { login: "이메일과 비밀번호를 입력해 주세요." })

    try {
        const member = await request("/login", "POST", { email: f.email.trim(), password: f.password })
        saveLogin(member.id, loginForm.keep.checked)
        openMypage(member)
    } catch (err) {
        setErrors(loginForm, { login: err.message || "서버에 연결할 수 없습니다." })
    }
})

// 회원가입
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const f = formData(signupForm)
    const errors = validate(f, "signup")
    if (Object.keys(errors).length) return setErrors(signupForm, errors)

    try {
        await request("/member", "POST", { ...toBody(f), password: f.password })
        show("login")
        toast("회원가입이 완료되었습니다. 로그인해 주세요.")
    } catch (err) {
        if (err.status === 409) return setErrors(signupForm, { email: "이미 사용 중인 이메일입니다." })
        toast(err.message || "서버에 연결할 수 없습니다.")
    }
})

// 로그아웃
$("#logoutBtn").addEventListener("click", () => {
    me = null
    clearLogin()
    show("login")
})

// 수정
$("#editBtn").addEventListener("click", () => editMode(true))
$("#cancelBtn").addEventListener("click", () => editMode(false))
editForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const f = formData(editForm)
    const errors = validate(f, "edit")
    if (Object.keys(errors).length) return setErrors(editForm, errors)

    // 비밀번호는 입력했을 때만 변경
    const body = toBody(f)
    if (f.password) body.password = f.password

    try {
        me = await request(`/member/${me.id}`, "PATCH", body)
        renderMe()
        editMode(false)
        toast("회원 정보가 수정되었습니다.")
    } catch (err) {
        if (err.status === 409) return setErrors(editForm, { email: "이미 사용 중인 이메일입니다." })
        toast(err.message || "서버에 연결할 수 없습니다.")
    }
})

// 탈퇴
const modal = $("#deleteModal")
$("#withdrawBtn").addEventListener("click", () => (modal.hidden = false))
$("#deleteCancelBtn").addEventListener("click", () => (modal.hidden = true))
// 바깥 어두운 영역 클릭 시 닫기
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true
})
$("#deleteOkBtn").addEventListener("click", async () => {
    try {
        await request(`/member/${me.id}`, "DELETE")
        modal.hidden = true
        me = null
        clearLogin()
        show("login")
        toast("회원 탈퇴가 완료되었습니다.")
    } catch (err) {
        toast(err.message || "서버에 연결할 수 없습니다.")
    }
})

// ---------- 시작 ----------

// 저장된 로그인 정보가 있으면 바로 마이페이지
;(async () => {
    const id = savedLoginId()
    if (!id) return
    try {
        openMypage(await request(`/member/${id}`))
    } catch {
        clearLogin()
    }
})()
