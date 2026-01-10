# Common Code Review Issues

## Security Issues

### Command Injection

**Bad:**
```typescript
// Shell interpolation allows injection
import { execSync } from 'child_process'
const result = execSync(`ls ${userInput}`) // DANGEROUS
```

**Good:**
```typescript
// execFile with array args prevents injection
import { execFile } from 'child_process'
execFile('ls', [userInput], (err, stdout) => { /* ... */ })
```

---

### SQL Injection

**Bad:**
```typescript
const query = `SELECT * FROM users WHERE id = ${userId}`
```

**Good:**
```typescript
const query = 'SELECT * FROM users WHERE id = $1'
await db.query(query, [userId])
```

---

### Path Traversal

**Bad:**
```typescript
const filePath = path.join(baseDir, userInput)
await fs.readFile(filePath)
```

**Good:**
```typescript
const filePath = path.join(baseDir, userInput)
const resolved = path.resolve(filePath)
if (!resolved.startsWith(path.resolve(baseDir))) {
  throw new Error('Path traversal detected')
}
await fs.readFile(resolved)
```

---

## Logic Issues

### Floating Promises

**Bad:**
```typescript
async function process() {
  doAsyncThing() // Promise not awaited!
  return result
}
```

**Good:**
```typescript
async function process() {
  await doAsyncThing()
  return result
}
```

---

### Missing Null Checks

**Bad:**
```typescript
const name = user.profile.name // Crashes if profile is null
```

**Good:**
```typescript
const name = user?.profile?.name ?? 'Unknown'
```

---

### Race Conditions

**Bad:**
```typescript
if (!cache.has(key)) {
  const value = await fetchValue(key)
  cache.set(key, value) // Another request might have set it already
}
```

**Good:**
```typescript
const existing = cache.get(key)
if (existing) return existing

const value = await fetchValue(key)
cache.set(key, value) // Or use a proper mutex/semaphore
return value
```

---

## Performance Issues

### N+1 Queries

**Bad:**
```typescript
const users = await db.query('SELECT * FROM users')
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id])
}
```

**Good:**
```typescript
const users = await db.query('SELECT * FROM users')
const userIds = users.map(u => u.id)
const posts = await db.query('SELECT * FROM posts WHERE user_id = ANY($1)', [userIds])
```

---

### Memory Leaks - Event Listeners

**Bad:**
```typescript
useEffect(() => {
  window.addEventListener('resize', handler)
  // Missing cleanup!
}, [])
```

**Good:**
```typescript
useEffect(() => {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

---

### Unnecessary Re-renders

**Bad:**
```typescript
function Component() {
  const handler = () => {} // New function every render
  return <Button onClick={handler} />
}
```

**Good:**
```typescript
function Component() {
  const handler = useCallback(() => {}, [])
  return <Button onClick={handler} />
}
```

---

## TypeScript Issues

### Using `any`

**Bad:**
```typescript
function process(data: any) {
  return data.value // No type safety
}
```

**Good:**
```typescript
interface Data {
  value: string
}
function process(data: Data) {
  return data.value // Type checked
}
```

---

### Missing Return Types

**Bad:**
```typescript
function calculate(x: number, y: number) {
  return x + y // Return type inferred but not explicit
}
```

**Good:**
```typescript
function calculate(x: number, y: number): number {
  return x + y
}
```
