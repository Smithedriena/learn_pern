// CodeQuest curriculum: 4 tracks x 5 challenges (mix lesson + code + quiz)
// Each challenge is graded either by JS function tests, string-match, or MCQ.

export const TRACKS = [
  {
    id: "react",
    name: "React",
    tag: "UI Realm",
    color: "#00F0FF",
    blurb: "Master components, state and hooks by defeating render bugs.",
    icon: "atom",
  },
  {
    id: "typescript",
    name: "TypeScript",
    tag: "Type Forge",
    color: "#39FF14",
    blurb: "Forge bulletproof code with types, generics and inference.",
    icon: "shield",
  },
  {
    id: "nodejs",
    name: "Node.js",
    tag: "Server Depths",
    color: "#FFE800",
    blurb: "Handle async, streams and HTTP like a boss in Node.",
    icon: "server",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    tag: "Data Vault",
    color: "#FF003C",
    blurb: "Query, join and index your way through the data vault.",
    icon: "database",
  },
];

// Helper: normalise SQL for matching
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/;$/g, "").trim();

export const CHALLENGES = [
  // ---------------- REACT ----------------
  {
    id: "react-1",
    trackId: "react",
    title: "Hello, Component",
    xp: 40,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# Your first component\n\nA React component is just a function that returns UI. Return a string from \`greet(name)\` that says exactly: **"Hello, <name>!"**.\n\n\`\`\`jsx\nfunction Hello({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\`\`\`\n\nWe'll test the plain string helper below so you can focus on the pattern.`,
    starter: `// Return the exact greeting string used by the component\nfunction greet(name) {\n  // your code\n}`,
    entry: "greet",
    tests: [
      { input: ["Ada"], expected: "Hello, Ada!" },
      { input: ["Neo"], expected: "Hello, Neo!" },
      { input: [""], expected: "Hello, !" },
    ],
    hints: ["Use a template literal: `Hello, ${name}!`"],
  },
  {
    id: "react-2",
    trackId: "react",
    title: "Counter State",
    xp: 60,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# useState in one line\n\nWrite \`nextCount(current, step)\` that returns the new count after clicking a button — a stand-in for what \`setCount(c => c + step)\` computes.`,
    starter: `function nextCount(current, step) {\n  // return the updated count\n}`,
    entry: "nextCount",
    tests: [
      { input: [0, 1], expected: 1 },
      { input: [5, 3], expected: 8 },
      { input: [10, -4], expected: 6 },
    ],
    hints: ["Just add them.", "Return current + step."],
  },
  {
    id: "react-3",
    trackId: "react",
    title: "Render a List",
    xp: 80,
    difficulty: "Adept",
    kind: "code",
    lesson: `# Mapping arrays to UI\n\nGiven a list of todo strings, return an array of HTML-ish \`<li>Name</li>\` strings — mirroring what \`todos.map(t => <li>{t}</li>)\` produces.`,
    starter: `function renderList(items) {\n  // return array of strings like "<li>Buy milk</li>"\n}`,
    entry: "renderList",
    tests: [
      { input: [["a", "b"]], expected: ["<li>a</li>", "<li>b</li>"] },
      { input: [[]], expected: [] },
      { input: [["Buy milk"]], expected: ["<li>Buy milk</li>"] },
    ],
    hints: ["Use .map()", "Return `<li>${x}</li>`"],
  },
  {
    id: "react-4",
    trackId: "react",
    title: "Key Concept: Keys",
    xp: 50,
    difficulty: "Adept",
    kind: "quiz",
    lesson: `# Why do lists need \`key\` props?\n\nReact uses keys to identify which items changed between renders.`,
    question: "Which value is the BEST key when rendering a list of user records?",
    options: [
      "The array index",
      "A stable unique id (like user.id)",
      "Math.random() on each render",
      "The user's display name",
    ],
    answer: 1,
    hints: ["Keys must be stable across renders.", "Random breaks reconciliation."],
  },
  {
    id: "react-5",
    trackId: "react",
    title: "Effect Cleanup",
    xp: 100,
    difficulty: "Pro",
    kind: "code",
    lesson: `# Simulating useEffect cleanup\n\n\`useEffect\` can return a cleanup function. Write \`runEffect(setup)\` that calls \`setup()\` (which returns a cleanup function), then invokes that cleanup and returns the string "cleaned".`,
    starter: `function runEffect(setup) {\n  // call setup, then its returned cleanup\n}`,
    entry: "runEffect",
    tests: [
      { input: [() => () => "cleaned"], expected: "cleaned" },
      { input: [() => () => "cleaned"], expected: "cleaned" },
    ],
    hints: ["Call setup() to get the cleanup fn.", "Then invoke it and return its return value."],
  },

  // ---------------- TYPESCRIPT ----------------
  {
    id: "ts-1",
    trackId: "typescript",
    title: "Typed Sum",
    xp: 40,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# Function types\n\nIn TS you'd write \`function add(a: number, b: number): number\`. Implement plain \`add(a, b)\` — we simulate the type check by feeding numbers only.`,
    starter: `function add(a, b) {\n  // return the sum\n}`,
    entry: "add",
    tests: [
      { input: [2, 3], expected: 5 },
      { input: [-4, 10], expected: 6 },
      { input: [0, 0], expected: 0 },
    ],
    hints: ["Return a + b"],
  },
  {
    id: "ts-2",
    trackId: "typescript",
    title: "Narrowing",
    xp: 60,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# Type narrowing\n\nGiven a value that is either a \`string\` or \`number\`, return its length in chars (numbers count their digit length, negative sign included).`,
    starter: `function len(v) {\n  // string -> chars; number -> digits+sign\n}`,
    entry: "len",
    tests: [
      { input: ["hello"], expected: 5 },
      { input: [123], expected: 3 },
      { input: [-42], expected: 3 },
    ],
    hints: ["typeof v === 'string' ? v.length : String(v).length"],
  },
  {
    id: "ts-3",
    trackId: "typescript",
    title: "Generics 101",
    xp: 80,
    difficulty: "Adept",
    kind: "code",
    lesson: `# The identity generic\n\n\`function id<T>(x: T): T { return x; }\` — implement \`identity(x)\` that returns the exact input reference.`,
    starter: `function identity(x) {\n  // return the same value\n}`,
    entry: "identity",
    tests: [
      { input: [42], expected: 42 },
      { input: ["hi"], expected: "hi" },
      { input: [null], expected: null },
    ],
    hints: ["Return x."],
  },
  {
    id: "ts-4",
    trackId: "typescript",
    title: "Interface vs Type",
    xp: 50,
    difficulty: "Adept",
    kind: "quiz",
    lesson: `# Interfaces & Type aliases\n\nBoth describe object shapes, but they differ in one key ability.`,
    question: "Which statement is TRUE about interfaces in TypeScript?",
    options: [
      "Interfaces cannot describe function types",
      "Interfaces support declaration merging (can be reopened)",
      "Interfaces cannot extend other interfaces",
      "Interfaces are erased differently from type aliases at runtime",
    ],
    answer: 1,
    hints: ["Think 'declaration merging'."],
  },
  {
    id: "ts-5",
    trackId: "typescript",
    title: "Discriminated Union",
    xp: 100,
    difficulty: "Pro",
    kind: "code",
    lesson: `# Discriminated unions\n\nShape can be \`{ kind: 'circle', r }\` or \`{ kind: 'square', s }\`. Return the area (use Math.PI for circles).`,
    starter: `function area(shape) {\n  // switch on shape.kind\n}`,
    entry: "area",
    tests: [
      { input: [{ kind: "square", s: 4 }], expected: 16 },
      { input: [{ kind: "circle", r: 1 }], expected: Math.PI },
      { input: [{ kind: "square", s: 0 }], expected: 0 },
    ],
    hints: ["shape.kind === 'circle' ? Math.PI * r*r : s*s"],
  },

  // ---------------- NODE.JS ----------------
  {
    id: "node-1",
    trackId: "nodejs",
    title: "Async / Await",
    xp: 40,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# Awaiting a promise\n\nWrite an async function \`doubleAsync(n)\` that resolves to \`n * 2\`.`,
    starter: `async function doubleAsync(n) {\n  // return n * 2\n}`,
    entry: "doubleAsync",
    tests: [
      { input: [3], expected: 6, async: true },
      { input: [-1], expected: -2, async: true },
    ],
    hints: ["An async function auto-wraps returns in Promise.resolve."],
  },
  {
    id: "node-2",
    trackId: "nodejs",
    title: "JSON Parse Safe",
    xp: 60,
    difficulty: "Rookie",
    kind: "code",
    lesson: `# Robust parsing\n\nReturn the parsed object, or \`null\` if input isn't valid JSON.`,
    starter: `function safeParse(text) {\n  // try/catch JSON.parse\n}`,
    entry: "safeParse",
    tests: [
      { input: ['{"a":1}'], expected: { a: 1 } },
      { input: ["nope"], expected: null },
      { input: ["[1,2]"], expected: [1, 2] },
    ],
    hints: ["Wrap JSON.parse in try/catch."],
  },
  {
    id: "node-3",
    trackId: "nodejs",
    title: "Event Loop MCQ",
    xp: 50,
    difficulty: "Adept",
    kind: "quiz",
    lesson: `# Node event loop\n\nMicrotasks vs macrotasks matters.`,
    question: "Which runs FIRST after the current synchronous code finishes?",
    options: [
      "setTimeout(fn, 0)",
      "setImmediate(fn)",
      "Promise.resolve().then(fn)",
      "fs.readFile callback",
    ],
    answer: 2,
    hints: ["Microtasks (promises) beat macrotasks."],
  },
  {
    id: "node-4",
    trackId: "nodejs",
    title: "Route Matcher",
    xp: 80,
    difficulty: "Adept",
    kind: "code",
    lesson: `# Mini router\n\nGiven \`method\` and \`path\`, return a response string like \`"GET /users -> ok"\`, or \`"404"\` for unknown routes. Known routes: \`GET /users\`, \`POST /users\`.`,
    starter: `function route(method, path) {\n  // return the response\n}`,
    entry: "route",
    tests: [
      { input: ["GET", "/users"], expected: "GET /users -> ok" },
      { input: ["POST", "/users"], expected: "POST /users -> ok" },
      { input: ["DELETE", "/users"], expected: "404" },
      { input: ["GET", "/nope"], expected: "404" },
    ],
    hints: ["Match on (method + ' ' + path)."],
  },
  {
    id: "node-5",
    trackId: "nodejs",
    title: "Promise.all Sum",
    xp: 100,
    difficulty: "Pro",
    kind: "code",
    lesson: `# Parallel awaits\n\nGiven an array of numbers, return a Promise that resolves to their sum — as if each came from an async call.`,
    starter: `async function sumAll(nums) {\n  // resolve to the sum\n}`,
    entry: "sumAll",
    tests: [
      { input: [[1, 2, 3]], expected: 6, async: true },
      { input: [[]], expected: 0, async: true },
      { input: [[10, -2, 5]], expected: 13, async: true },
    ],
    hints: ["reduce((a,b)=>a+b, 0)"],
  },

  // ---------------- POSTGRES ----------------
  {
    id: "pg-1",
    trackId: "postgres",
    title: "SELECT All",
    xp: 40,
    difficulty: "Rookie",
    kind: "sql",
    lesson: `# Your first query\n\nSelect every column from the \`users\` table.`,
    starter: `-- Write the query below\n`,
    solutions: ["select * from users"],
    hints: ["Use SELECT * FROM users"],
  },
  {
    id: "pg-2",
    trackId: "postgres",
    title: "WHERE Filter",
    xp: 60,
    difficulty: "Rookie",
    kind: "sql",
    lesson: `# Filtering rows\n\nFrom the \`orders\` table, select every column where \`status\` equals \`'paid'\`.`,
    starter: `-- your query\n`,
    solutions: ["select * from orders where status = 'paid'"],
    hints: ["Use WHERE status = 'paid'"],
  },
  {
    id: "pg-3",
    trackId: "postgres",
    title: "Aggregate Count",
    xp: 80,
    difficulty: "Adept",
    kind: "sql",
    lesson: `# Aggregations\n\nReturn the total number of rows in the \`products\` table aliased as \`total\`.`,
    starter: `-- your query\n`,
    solutions: [
      "select count(*) as total from products",
      "select count(*) total from products",
    ],
    hints: ["COUNT(*) AS total"],
  },
  {
    id: "pg-4",
    trackId: "postgres",
    title: "INDEX Trivia",
    xp: 50,
    difficulty: "Adept",
    kind: "quiz",
    lesson: `# Indexes\n\nIndexes speed up reads but affect writes.`,
    question: "Which is TRUE about a B-tree index on a large PostgreSQL table?",
    options: [
      "It makes INSERTs faster",
      "It speeds equality/range lookups on the indexed column",
      "It replaces the need for a primary key",
      "It removes duplicate rows automatically",
    ],
    answer: 1,
    hints: ["Reads, not writes."],
  },
  {
    id: "pg-5",
    trackId: "postgres",
    title: "INNER JOIN",
    xp: 100,
    difficulty: "Pro",
    kind: "sql",
    lesson: `# Joining tables\n\nSelect \`users.name\` and \`orders.total\` by inner-joining \`users\` and \`orders\` on \`users.id = orders.user_id\`.`,
    starter: `-- your query\n`,
    solutions: [
      "select users.name, orders.total from users inner join orders on users.id = orders.user_id",
      "select users.name, orders.total from users join orders on users.id = orders.user_id",
    ],
    hints: ["INNER JOIN … ON users.id = orders.user_id"],
  },
];

export const BADGES = [
  { id: "first-step", name: "First Step", desc: "Complete your first challenge", condition: (p) => p.completed.length >= 1 },
  { id: "react-rookie", name: "React Rookie", desc: "Clear 3 React challenges", condition: (p) => count(p, "react") >= 3 },
  { id: "type-forger", name: "Type Forger", desc: "Clear 3 TypeScript challenges", condition: (p) => count(p, "typescript") >= 3 },
  { id: "server-diver", name: "Server Diver", desc: "Clear 3 Node.js challenges", condition: (p) => count(p, "nodejs") >= 3 },
  { id: "sql-sorcerer", name: "SQL Sorcerer", desc: "Clear 3 PostgreSQL challenges", condition: (p) => count(p, "postgres") >= 3 },
  { id: "streak-3", name: "On Fire", desc: "3-day streak", condition: (p) => p.streak >= 3 },
  { id: "polymath", name: "Polymath", desc: "Clear ≥1 challenge in every track", condition: (p) => TRACKS.every((t) => count(p, t.id) >= 1) },
  { id: "level-5", name: "Level 5", desc: "Reach level 5", condition: (p) => p.level >= 5 },
];

function count(p, trackId) {
  return p.completed.filter((id) => (CHALLENGES.find((c) => c.id === id)?.trackId) === trackId).length;
}

// SQL grading
export function checkSql(userSql, solutions) {
  const n = norm(userSql);
  return solutions.some((s) => norm(s) === n);
}

// XP required for level (level 1 starts at 0)
export function xpForLevel(level) {
  return Math.round(100 * Math.pow(1.35, level - 1));
}
export function levelFromXp(xp) {
  let lvl = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(lvl)) {
    remaining -= xpForLevel(lvl);
    lvl += 1;
  }
  return { level: lvl, into: remaining, needed: xpForLevel(lvl) };
}
