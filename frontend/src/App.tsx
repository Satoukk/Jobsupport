import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { api, errorMessage } from "./api";
import supo from "./assets/supo.png";

type User = { id: number; username: string; email: string };
type Character = { name: string; level: number; exp: number };
type Company = {
  id: number;
  company_name: string;
  industry: string;
  memo: string;
  status: string;
};
type Task = { id: number; title: string; done: boolean };
type Schedule = {
  id: number;
  title: string;
  schedule_at: string;
  memo: string;
};
const statuses: Record<string, string> = {
  interested: "気になる",
  applying: "選考中",
  offer: "内定",
  closed: "終了",
};
const date = (value: string) =>
  new Date(value).toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(() => !sessionStorage.getItem("token"));
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    if (sessionStorage.getItem("token"))
      api
        .get("/me")
        .then((r) => setUser(r.data.user))
        .catch(() => sessionStorage.removeItem("token"))
        .finally(() => setReady(true));
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  if (!ready) return <div className="loading">✿ ページを準備しています…</div>;
  return (
    <Routes>
      <Route
        path="/Login"
        element={
          user ? <Navigate to="/" replace /> : <Auth onLogin={setUser} />
        }
      />
      <Route
        path="/Register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Auth register onLogin={setUser} />
          )
        }
      />
      <Route
        path="*"
        element={
          user ? (
            <Workspace
              user={user}
              logout={() => {
                sessionStorage.removeItem("token");
                setUser(null);
              }}
            />
          ) : (
            <Navigate to="/Login" replace />
          )
        }
      />
    </Routes>
  );
}
function Auth({
  register = false,
  onLogin,
}: {
  register?: boolean;
  onLogin: (u: User) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await api.post(register ? "/users" : "/users/login", values);
      sessionStorage.setItem("token", r.data.token);
      onLogin(r.data.user);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="authLayout">
      <Link to="/" className="brand">
        ✿ JOBサポ<span>小さな一歩を、いっしょに。</span>
      </Link>
      <main className="authCard">
        <section>
          <span className="eyebrow">MY CAREER, MY PACE</span>
          <h1>{register ? "ここから、はじめよう。" : "おかえりなさい。"}</h1>
          <p className="muted">
            {register
              ? "あなただけの相棒と、一歩ずつ未来を育てよう。"
              : "今日も、あなたのペースで大丈夫。"}
          </p>
          <form onSubmit={submit} key={String(register)}>
            {register && (
              <label>
                お名前
                <input
                  name="username"
                  required
                  maxLength={50}
                  autoComplete="name"
                  placeholder="サポ 太郎"
                />
              </label>
            )}
            <label>
              メールアドレス
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
              />
            </label>
            <label>
              パスワード
              <input
                name="password"
                type="password"
                required
                minLength={register ? 8 : undefined}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder="8文字以上"
              />
            </label>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="primary" disabled={busy}>
              {busy
                ? "お待ちください…"
                : register
                  ? "無料で始める →"
                  : "ログイン →"}
            </button>
          </form>
          <p className="authSwitch">
            {register ? "アカウントをお持ちの方は" : "はじめての方は"}{" "}
            <Link
              to={register ? "/Login" : "/Register"}
              onClick={() => setError("")}
            >
              {register ? "ログイン" : "新規登録"}
            </Link>
          </p>
        </section>
        <aside>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <img src={supo} alt="相棒のサポ" />
          <h2>
            就活を、
            <br />
            ひとりにしない。
          </h2>
          <p>
            応募も、選考も、ひと休みも。
            <br />
            あなたの頑張りを、相棒が見守ります。
          </p>
        </aside>
      </main>
      <p className="authFoot">✧ 小さな一歩も、ちゃんと前進。</p>
    </div>
  );
}
function Workspace({ user, logout }: { user: User; logout: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [now] = useState(() => Date.now());
  const applyData = useCallback(
    (data: Awaited<ReturnType<typeof fetchDashboard>>) => {
      const [co, ta, sc, ch] = data;
      setCompanies(co.data.companies);
      setTasks(ta.data.tasks);
      setSchedules(sc.data.schedules);
      setCharacter(ch.data.character);
    },
    [],
  );
  const load = useCallback(() => fetchDashboard().then(applyData), [applyData]);
  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((data) => {
        if (active) applyData(data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applyData]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  async function mutate(
    action: () => Promise<unknown>,
    message: string,
  ): Promise<boolean> {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      await action();
      await load();
      setNotice(message);
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  const upcoming = schedules.filter(
    (s) => new Date(s.schedule_at).getTime() >= now,
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          ✿ JOBサポ<span>小さな一歩を、いっしょに。</span>
        </Link>
        <p className="navCaption">MY WORKSPACE</p>
        <nav>
          {[
            ["/", "⌂", "ホーム"],
            ["/companies", "▤", "企業・選考"],
            ["/missions", "✧", "ミッション"],
            ["/schedules", "◷", "スケジュール"],
            ["/account", "☘", "アカウント"],
          ].map(([to, icon, label]) => (
            <NavLink end={to === "/"} key={to} to={to}>
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sideNote">
          <span>✿</span>
          <p>
            昨日の自分より、
            <br />
            ほんの少し先へ。
          </p>
        </div>
        <div className="userBadge">
          <span>{user.username.slice(0, 1)}</span>
          <div>
            {user.username}
            <small>あなたらしい就活を</small>
          </div>
        </div>
      </aside>
      <div className="content">
        <header>
          <span>YOUR CAREER JOURNAL</span>
          <Link to="/account">
            {user.username} さん <span className="avatar">☘</span>
          </Link>
        </header>
        {notice && (
          <div className="toast" role="status">
            ✓ {notice}
          </div>
        )}
        {error && (
          <div className="error banner" role="alert">
            {error}
            <button
              onClick={() => {
                setError("");
                setLoading(true);
                load()
                  .catch((e) => setError(errorMessage(e)))
                  .finally(() => setLoading(false));
              }}
            >
              再読み込み
            </button>
          </div>
        )}
        {loading ? (
          <div className="loading">✿ 読み込んでいます…</div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="pageHeading">
                    <div>
                      <span className="eyebrow">A LITTLE STEP, EVERY DAY</span>
                      <h1>
                        今日も一歩ずつ<span className="flower">✿</span>
                      </h1>
                      <p>焦らなくて大丈夫。あなたのペースで進めていこう。</p>
                    </div>
                    <Link className="outline" to="/missions">
                      今日のミッション ↗
                    </Link>
                  </div>
                  <section className="partner">
                    <div>
                      <span className="pill">YOUR PARTNER</span>
                      <h2>{character?.name}と、未来を育てよう。</h2>
                      <p>
                        {tasks.some((t) => t.done)
                          ? "積み重ねた一歩が、ちゃんと力になっているよ。"
                          : "今日はどんな一歩を踏み出そう？ぼくも一緒だよ。"}
                      </p>
                      <div className="levelRow">
                        <b>Lv. {character?.level ?? 1}</b>
                        <span>
                          次のレベルまで {100 - (character?.exp ?? 0)} EXP
                        </span>
                      </div>
                      <progress
                        aria-label="相棒の経験値"
                        max={100}
                        value={character?.exp ?? 0}
                      />
                      <small>ミッションを達成すると +25 EXP</small>
                    </div>
                    <div className="partnerArt">
                      <span>✧</span>
                      <img src={supo} alt="あなたの相棒" />
                      <span>✦</span>
                    </div>
                  </section>
                  <div className="sectionTitle">
                    <h2>就活の進み具合</h2>
                    <span>OVERVIEW</span>
                  </div>
                  <div className="stats">
                    {Object.entries(statuses).map(([key, label], i) => (
                      <Link
                        to="/companies"
                        className={"stat tone" + i}
                        key={key}
                      >
                        <span>{["♡", "✧", "✿", "✓"][i]}</span>
                        <p>{label}</p>
                        <strong>
                          {companies.filter((c) => c.status === key).length}
                          <small>社</small>
                        </strong>
                      </Link>
                    ))}
                  </div>
                  <div className="twoColumns">
                    <section className="panel">
                      <div className="sectionTitle">
                        <h2>これからの予定</h2>
                        <Link to="/schedules">すべて見る →</Link>
                      </div>
                      {upcoming.length ? (
                        upcoming.slice(0, 3).map((s) => (
                          <div className="listRow" key={s.id}>
                            <span className="dateIcon">
                              {new Date(s.schedule_at).getDate()}
                              <small>
                                {new Date(s.schedule_at).getMonth() + 1}月
                              </small>
                            </span>
                            <div>
                              <b>{s.title}</b>
                              <small>{date(s.schedule_at)}</small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <Empty
                          text="予定を登録して、次の一歩を見える形に。"
                          to="/schedules"
                          label="予定を追加"
                        />
                      )}
                    </section>
                    <section className="panel">
                      <div className="sectionTitle">
                        <h2>今日の小さな一歩</h2>
                        <Link to="/missions">すべて見る →</Link>
                      </div>
                      {tasks
                        .filter((t) => !t.done)
                        .slice(0, 3)
                        .map((t) => (
                          <div className="listRow" key={t.id}>
                            <button
                              className="check"
                              disabled={busy}
                              aria-label={t.title + "を達成"}
                              onClick={() =>
                                void mutate(
                                  () => api.post(`/tasks/${t.id}/complete`),
                                  "ミッション達成！ +25 EXP",
                                )
                              }
                            >
                              ✓
                            </button>
                            <div>
                              {t.title}
                              <small>+25 EXP</small>
                            </div>
                          </div>
                        ))}
                      {tasks.every((t) => t.done) && (
                        <Empty
                          text="今日もおつかれさま。次の目標を決めよう。"
                          to="/missions"
                          label="ミッションを見る"
                        />
                      )}
                    </section>
                  </div>
                </>
              }
            />
            <Route
              path="/companies"
              element={
                <Companies items={companies} mutate={mutate} busy={busy} />
              }
            />
            <Route
              path="/missions"
              element={<Missions items={tasks} mutate={mutate} busy={busy} />}
            />
            <Route
              path="/schedules"
              element={
                <Schedules items={schedules} mutate={mutate} busy={busy} />
              }
            />
            <Route
              path="/account"
              element={
                <>
                  <Heading
                    title="あなたと相棒"
                    subtitle="自分らしいペースで、これからも。"
                  />
                  <section className="panel account">
                    <img src={supo} alt="相棒" />
                    <h2>{user.username} さん</h2>
                    <p>{user.email}</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const name = new FormData(e.currentTarget).get("name");
                        void mutate(
                          () => api.put("/characters", { name }),
                          "相棒の名前を変更しました",
                        );
                      }}
                    >
                      <label>
                        相棒の名前
                        <input
                          name="name"
                          key={character?.name}
                          defaultValue={character?.name}
                          required
                          maxLength={30}
                        />
                      </label>
                      <button className="primary" disabled={busy}>
                        名前を保存
                      </button>
                    </form>
                    <button
                      className="outline"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await api.post("/logout");
                          logout();
                        } catch (e) {
                          setError(errorMessage(e));
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                    >
                      ログアウト
                    </button>
                  </section>
                </>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <Heading
                    title="ページが見つかりません"
                    subtitle="ホームから、もう一度お進みください。"
                  />
                  <Link className="primary" to="/">
                    ホームへ戻る
                  </Link>
                </>
              }
            />
          </Routes>
        )}
        <footer>
          ✿ JOBサポ <span>あなたの小さな一歩を、応援しています。</span>
        </footer>
      </div>
    </div>
  );
}
function fetchDashboard() {
  return Promise.all([
    api.get("/companies"),
    api.get("/tasks"),
    api.get("/schedules"),
    api.get("/characters"),
  ]);
}
type Mutate = (
  action: () => Promise<unknown>,
  message: string,
) => Promise<boolean>;
function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pageHeading">
      <div>
        <span className="eyebrow">YOUR CAREER, YOUR PACE</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
function Empty({
  text,
  to,
  label,
}: {
  text: string;
  to?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <span>☘</span>
      <p>{text}</p>
      {to && <Link to={to}>{label} →</Link>}
    </div>
  );
}
function Companies({
  items,
  mutate,
  busy,
}: {
  items: Company[];
  mutate: Mutate;
  busy: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [edit, setEdit] = useState<Company | "new" | null>(null);
  const filtered = items.filter(
    (c) =>
      (!filter || c.status === filter) &&
      `${c.company_name} ${c.industry} ${c.memo}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (
      await mutate(
        () =>
          edit !== "new" && edit
            ? api.put(`/companies/${edit.id}`, data)
            : api.post("/companies", data),
        "企業情報を保存しました",
      )
    )
      setEdit(null);
  }
  return (
    <>
      <Heading
        title="企業・選考管理"
        subtitle="気になる企業も、選考の記録も、ここにまとめよう。"
      />
      <div className="toolbar">
        <input
          aria-label="企業を検索"
          placeholder="企業名・業界・メモで検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="選考状況で絞り込み"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">すべての状況</option>
          {Object.entries(statuses).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="primary" onClick={() => setEdit("new")}>
          ＋ 企業を登録
        </button>
      </div>
      {edit && (
        <section className="panel">
          <h2>{edit === "new" ? "企業を登録" : "企業情報を編集"}</h2>
          <form key={edit === "new" ? "new" : edit.id} onSubmit={save}>
            <div className="formGrid">
              <label>
                企業名
                <input
                  name="company_name"
                  required
                  maxLength={120}
                  defaultValue={edit === "new" ? "" : edit.company_name}
                />
              </label>
              <label>
                業界
                <input
                  name="industry"
                  maxLength={100}
                  defaultValue={edit === "new" ? "" : edit.industry}
                />
              </label>
              <label>
                選考状況
                <select
                  name="status"
                  aria-label="選考状況"
                  defaultValue={edit === "new" ? "interested" : edit.status}
                >
                  {Object.entries(statuses).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              メモ
              <textarea
                aria-label="メモ"
                name="memo"
                maxLength={3000}
                defaultValue={edit === "new" ? "" : edit.memo}
                placeholder="志望理由や、面接で気づいたことなど"
              />
            </label>
            <div className="actions">
              <button className="primary" disabled={busy}>
                保存する
              </button>
              <button
                type="button"
                className="outline"
                onClick={() => setEdit(null)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </section>
      )}
      <p className="resultCount">{filtered.length} 社の企業</p>
      <div className="companyGrid">
        {filtered.map((c) => (
          <article className="panel companyCard" key={c.id}>
            <span className={"status " + c.status}>{statuses[c.status]}</span>
            <h2>{c.company_name}</h2>
            <p className="muted">{c.industry || "業界未設定"}</p>
            <p className="memo">{c.memo || "メモはまだありません。"}</p>
            <div className="actions">
              <button className="outline" onClick={() => setEdit(c)}>
                編集
              </button>
              <button
                className="danger"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`${c.company_name}を削除しますか？`))
                    void mutate(
                      () => api.delete(`/companies/${c.id}`),
                      "企業を削除しました",
                    );
                }}
              >
                削除
              </button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          text={
            items.length
              ? "検索条件に合う企業がありません。"
              : "気になる企業を1社、登録してみよう。"
          }
        />
      )}
    </>
  );
}
function Missions({
  items,
  mutate,
  busy,
}: {
  items: Task[];
  mutate: Mutate;
  busy: boolean;
}) {
  const [title, setTitle] = useState("");
  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      await mutate(
        () => api.post("/tasks", { title }),
        "ミッションを追加しました",
      )
    )
      setTitle("");
  }
  return (
    <>
      <Heading
        title="小さなミッション"
        subtitle="ひとつ達成するたびに、あなたも相棒も成長します。"
      />
      <div className="missionInfo">
        <span>✧</span>
        <div>
          <b>一歩進んだら、相棒に教えよう。</b>
          <p>ミッション達成で +25 EXP。100 EXPでレベルアップ！</p>
        </div>
        <strong>
          {items.filter((t) => t.done).length}
          <small>達成</small>
        </strong>
      </div>
      <form className="toolbar" onSubmit={add}>
        <input
          aria-label="新しいミッション"
          placeholder="例：自己PRをひとつ書いてみる"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button className="primary" disabled={busy}>
          ＋ 追加する
        </button>
      </form>
      <section className="panel">
        {items.map((t) => (
          <div
            className={"listRow mission " + (t.done ? "done" : "")}
            key={t.id}
          >
            <button
              className="check"
              disabled={busy || t.done}
              aria-label={t.title + "を達成"}
              onClick={() =>
                void mutate(
                  () => api.post(`/tasks/${t.id}/complete`),
                  "ミッション達成！ +25 EXP",
                )
              }
            >
              ✓
            </button>
            <div>
              <b>{t.title}</b>
              <small>{t.done ? "達成済み · おつかれさま！" : "+25 EXP"}</small>
            </div>
            <button
              className="danger"
              disabled={busy}
              aria-label={t.title + "を削除"}
              onClick={() => {
                if (window.confirm("このミッションを削除しますか？"))
                  void mutate(
                    () => api.delete(`/tasks/${t.id}`),
                    "ミッションを削除しました",
                  );
              }}
            >
              削除
            </button>
          </div>
        ))}
        {!items.length && (
          <Empty text="あなたに合った、小さな目標を追加しよう。" />
        )}
      </section>
    </>
  );
}
function localInput(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function Schedules({
  items,
  mutate,
  busy,
}: {
  items: Schedule[];
  mutate: Mutate;
  busy: boolean;
}) {
  const [now] = useState(() => Date.now());
  const [edit, setEdit] = useState<Schedule | "new" | null>(null);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const data = {
      ...values,
      schedule_at: new Date(String(values.schedule_at)).toISOString(),
    };
    if (
      await mutate(
        () =>
          edit !== "new" && edit
            ? api.put(`/schedules/${edit.id}`, data)
            : api.post("/schedules", data),
        "予定を保存しました",
      )
    )
      setEdit(null);
  }
  return (
    <>
      <Heading
        title="スケジュール"
        subtitle="面接も、締め切りも。次の予定を、ひと目で。"
      />
      <div className="toolbar">
        <p className="muted">
          日時はお使いの端末のタイムゾーンで表示されます。
        </p>
        <button className="primary" onClick={() => setEdit("new")}>
          ＋ 予定を追加
        </button>
      </div>
      {edit && (
        <section className="panel">
          <h2>{edit === "new" ? "予定を追加" : "予定を編集"}</h2>
          <form key={edit === "new" ? "new" : edit.id} onSubmit={save}>
            <div className="formGrid">
              <label>
                予定名
                <input
                  name="title"
                  required
                  maxLength={120}
                  defaultValue={edit === "new" ? "" : edit.title}
                  placeholder="例：○○社 一次面接"
                />
              </label>
              <label>
                日時
                <input
                  type="datetime-local"
                  name="schedule_at"
                  required
                  defaultValue={
                    edit === "new" ? "" : localInput(edit.schedule_at)
                  }
                />
              </label>
            </div>
            <label>
              メモ
              <textarea
                aria-label="メモ"
                name="memo"
                maxLength={3000}
                defaultValue={edit === "new" ? "" : edit.memo}
              />
            </label>
            <div className="actions">
              <button className="primary" disabled={busy}>
                保存する
              </button>
              <button
                className="outline"
                type="button"
                onClick={() => setEdit(null)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="panel">
        {items.map((s) => (
          <div className="listRow scheduleRow" key={s.id}>
            <span className="dateIcon">
              {new Date(s.schedule_at).getDate()}
              <small>{new Date(s.schedule_at).getMonth() + 1}月</small>
            </span>
            <div>
              <small>
                {date(s.schedule_at)}{" "}
                {new Date(s.schedule_at).getTime() < now ? "· 過去の予定" : ""}
              </small>
              <h3>{s.title}</h3>
              <p className="memo">{s.memo}</p>
            </div>
            <div className="actions">
              <button className="outline" onClick={() => setEdit(s)}>
                編集
              </button>
              <button
                className="danger"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("この予定を削除しますか？"))
                    void mutate(
                      () => api.delete(`/schedules/${s.id}`),
                      "予定を削除しました",
                    );
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
        {!items.length && (
          <Empty text="予定はまだありません。次の一歩を登録しよう。" />
        )}
      </section>
    </>
  );
}
