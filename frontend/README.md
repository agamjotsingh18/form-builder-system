# ⚛️ Frontend Application - Dynamic Form Builder

This directory contains the complete client-side application for the Dynamic Form Builder system. It is a single-page application (SPA) built to consume the REST APIs provided by the local or deployed backend service.

---

## 🚀 Local Development Setup

To run the frontend locally and connect it to your backend:

### Prerequisites

1.  Node.js (v18+)
2.  The **`backend/`** server must be running and accessible (default: `http://localhost:3001/api`).
3.  The **`frontend/.env`** file must be created and updated with the correct base URL.

### Installation and Run

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies (using the flag to successfully resolve the TanStack dependency conflict):
    ```bash
    npm install --legacy-peer-deps
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

The application will typically be served by **Vite** at `http://localhost:5173`.

---


## 🌐 API Endpoints Consumed

The frontend connects to the backend API defined by the `VITE_API_BASE_URL` variable.

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/form-schema` | `GET` | Fetches the dynamic structure and validation rules for rendering. |
| `/api/submissions` | `POST` | Submits the validated form data. |
| `/api/submissions` | `GET` | Retrieves the paginated and searchable list of historical submissions. |
| `/api/submissions/:id` | `DELETE` | **(Bonus)** Deletes a specific submission. |

---


## ✅ Implemented Features

### Form Page (`/`)

* **Dynamic Rendering:** Fully renders all 8 field types based on the schema (Text, Number, Select, Multi-select, Date, Textarea, Switch).
* **Inline Validation:** Implements all schema validation rules (`minLength`/`maxLength`, `regex`, `min`/`max`, `minSelected`/`maxSelected`).
* **User Experience (UX):**
    * Submits data using a `useMutation` hook.
    * Shows professional **Toast** notifications for success/error events.
    * Clears the form and navigates to the `/submissions` page upon successful submission.

### Submissions Table Page (`/submissions`)

* **TanStack Table:** Implements core table functionality.
* **Server-Side Features:** Includes support for server-side pagination, sorting on the "Created Date," and total count display.