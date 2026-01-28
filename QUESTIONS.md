## 1. If this app had 10,000 employees checking in simultaneously, what would break first? How would you fix it?

**What might break first:**

* Backend API server could become slow or crash due to too many requests.
* Database could face heavy load because many insert and select queries will run at the same time.
* Authentication (JWT verification) and location saving could become slow.

**How I would fix it:**

* Use a **load balancer** to distribute traffic across multiple backend servers.
* Add **database indexing** on frequently used columns like `employee_id`, `client_id`, and `status`.
* Use **connection pooling** so database connections are reused efficiently.
* Cache frequently used data using **Redis**.
* Move heavy tasks (like logs, analytics) to **background workers / queues**.

**Result:**
The system becomes scalable and can handle high traffic smoothly.

---

## 2. The current JWT implementation has a security issue. What is it and how would you improve it?

**Issue:**

* JWT secret key  hard-coded or weak.
* Token  not have expiration or refresh mechanism.
* No token revocation on logout.

**Improvements:**

* Store JWT secret in **environment variables**.
* Add **short-lived access tokens** and **refresh tokens**.
* Set token expiration using `expiresIn`.
* Use **HTTPS** to protect tokens in transit.

**Result:**
Authentication becomes more secure and harder to exploit.

---

## 3. How would you implement offline check-in support?

**Idea:**

* When user is offline, save check-in data in **local storage or IndexedDB**.
* Detect internet connection using browser APIs.
* When internet is restored, automatically send saved records to backend.

**Steps:**

1. Save check-in locally if offline.
2. Show "Pending Sync" status in UI.
3. Sync data when online.

**Result:**
Employees can check in even without internet and data is safely synced later.

---

## 4. Difference between SQL and NoSQL databases

**SQL Databases:**

* Structured tables with rows and columns.
* Fixed schema.
* Strong relationships.
* Example: MySQL, PostgreSQL, SQLite.

**NoSQL Databases:**

* Flexible schema.
* Stores data as JSON, documents, or key-value.
* Scales easily.
* Example: MongoDB, Firebase.

**Recommendation for this project:**

* **SQL database** because:

  * Data is structured.
  * Relations exist (employees, clients, checkins).
  * Complex queries are required.

---

## 5. Difference between Authentication and Authorization

**Authentication:**

* Verifies who the user is.
* Example: Login with email and password.
* Implemented in: `auth.js` (login route, JWT generation).

**Authorization:**

* Verifies what the user can access.
* Example: Only logged-in user can check in.
* Implemented using JWT middleware.

---

## 6. What is a race condition? Any possible in this project?

**Race Condition:**
When two or more operations run at the same time and depend on each other, causing unpredictable results.

**Possible Case:**

* Two check-in requests at same time for same employee.

**Prevention:**

* Use database constraints.
* Use transactions.
* Lock rows during critical operations.

**Result:**
Data remains consistent and correct.
