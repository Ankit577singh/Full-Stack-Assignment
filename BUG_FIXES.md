# 🐞 Bug Fixes Documentation

This file contains a list of bugs found in the project, their root causes, and how they were fixed. 

---

## 1. Login fails even with correct credentials

**Location:**
`backend/routes/auth.js` (around line 28)

**Problem:**
`bcrypt.compare()` is an asynchronous function, but it was used without `await`.
Because of this, it returned a Promise instead of a `true/false` value, causing login to randomly fail.

**Old Code:**

```js
const isMatch = bcrypt.compare(password, user.password);
```

**Fix:**

```js
const isMatch = await bcrypt.compare(password, user.password);
```

**Why this works:**
`await` waits for the Promise to resolve and returns the actual boolean value.
Now the password is verified correctly and login works consistently.

---

## 2. Check-in form does not submit properly

### 2.1 Client ID validation returning wrong status

**Location:**
`backend/routes/checkin.js` – Line 30

**Problem:**
When `client_id` was missing, the API returned status code `200`, which is incorrect for an error.

**Fix:**

```js
return res.status(400).json({ success: false, message: 'Client ID is required' });
```

**Why this works:**
`400 Bad Request` means the client sent invalid or incomplete data.
This is the correct status code for this situation.

---

### 2.2 Active check-in not detected

**Location:**
`backend/routes/checkin.js` – Line 45

**Problem:**
The SQL query used double quotes for the status value.

**Fix:**

```sql
SELECT * FROM checkins
WHERE employee_id = ? AND status = 'checked_in'
```

**Why this works:**
In MySQL, string values should be inside single quotes.
Now the query matches records correctly.

---

### 2.3 Wrong column names in INSERT query

**Location:**
`backend/routes/checkin.js` – Line 57

**Problem:**
Columns were written as `lat` and `lang`, but actual column names are `latitude` and `longitude`.

**Fix:**

```sql
INSERT INTO checkins (employee_id, client_id, latitude, longitude, notes, status)
```

**Why this works:**
Column names now exactly match the database schema, so data is inserted successfully.

---

### 2.4 Checkout fetching wrong record

**Location:**
`backend/routes/checkin.js` – Line 79

**Problem:**
The query did not filter only active check-ins.

**Fix:**

```sql
SELECT * FROM checkins
WHERE employee_id = ? AND status = 'checked_in'
ORDER BY checkin_time DESC LIMIT 1
```

**Why this works:**
Only the latest active check-in is fetched. Old records are ignored.

---

### 2.5 Checkout update syntax issues

**Location:**
`backend/routes/checkin.js` – Line 87

**Problem:**
`NOW()` was used and status had double quotes.

**Fix:**

```sql
UPDATE checkins
SET checkout_time = CURRENT_TIMESTAMP, status = 'checked_out'
WHERE id = ?
```

**Why this works:**
`CURRENT_TIMESTAMP` is standard SQL syntax and single quotes correctly store string values.

---

## 3. Dashboard shows incorrect data for some users

**Location:**
`backend/routes/employee.js` – Line 82

**Problem:**
MySQL date function was used:

```sql
DATE_SUB(NOW(), INTERVAL 7 DAY)
```

But the project uses SQLite, which does not support this function.

**Fix:**

```sql
WHERE employee_id = ?
AND checkin_time >= date('now','-7 days')
```

**Why this works:**
`date('now','-7 days')` is valid SQLite syntax.
The query now returns correct last 7 days records.

---

## 4. Attendance history page crashes on load

**Location:**
`frontend/pages/History.jsx` – Line 3

**Problem:**
State was initialized with `null` and `.map()` was called on it.

**Before:**

```js
const [checkins, setCheckins] = useState(null);
```

**Fix:**

```js
const [checkins, setCheckins] = useState([]);
```

**Why this works:**
`.map()` works safely on an empty array.
The page no longer crashes and renders correctly after data loads.

---

## 5. API returns wrong status codes in certain scenarios

**Location:**
`backend/routes/checkin.js` – Line 30

**Problem:**
Missing `client_id` returned status `200`.

**Before:**

```js
return res.status(200).json({ success: false, message: 'Client ID is required' });
```

**Fix:**

```js
return res.status(400).json({ success: false, message: 'Client ID is required' });
```

**Why this works:**
`400 Bad Request` correctly represents client-side input errors.

---

## 6. Location data is not being saved correctly

**Location:**
`backend/routes/checkin.js` – Line 57

**Problem:**
Wrong column names used:

```sql
(lat, lang)
```

**Fix:**

```sql
(latitude, longitude)
```

**Why this works:**
Column names now match the database schema, so location values are stored correctly.

---

## 7. Some React components have performance issues and do not update correctly

**Location:**
`frontend/components/History.jsx` – Line 3

**Problem:**
State initialized as `null` caused crashes when using `.map()` or `.length`.

**Fix:**

```js
const [checkins, setCheckins] = useState([]);
```

**Why this works:**
React expects arrays for list rendering.
Using an empty array prevents crashes, improves re-rendering, and gives better performance.
