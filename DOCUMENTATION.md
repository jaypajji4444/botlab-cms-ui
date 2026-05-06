# BotLab CMS — UI Application Documentation

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [Authentication](#authentication)
7. [Modules](#modules)
   - [Pages](#pages-module)
   - [Sections](#sections-module)
   - [Blogs](#blogs-module)
   - [Portfolios](#portfolios-module)
   - [Reports](#reports-module)
   - [Careers](#careers-module)
   - [Case Studies](#case-studies-module)
   - [Layouts (Header/Footer)](#layouts-module)
   - [Leads](#leads-module)
   - [Contacts](#contacts-module)
   - [Users](#users-module)
   - [File Uploads](#file-uploads-module)
8. [Component Architecture](#component-architecture)
9. [API Client Layer](#api-client-layer)
10. [Forms & Validation](#forms--validation)
11. [Rich Text Editor](#rich-text-editor)
12. [Section Component System](#section-component-system)
13. [Environment Configuration](#environment-configuration)
14. [Deployment](#deployment)

---

## Overview

BotLab CMS is a full-featured Content Management System UI built with React and TypeScript. It provides an admin interface for managing website content including pages, blogs, portfolios, careers, case studies, reports, leads, and layout components (header/footer). The CMS connects to a NestJS backend via RESTful APIs.

**Key Capabilities:**

- Page building with reusable section templates
- Rich text blog editing with SEO features
- Portfolio project management with drone show metadata
- Career/job posting management with application tracking
- Lead capture and analytics with UTM tracking
- File upload (images, videos, documents)
- User management with role-based authentication
- Header/Footer layout management

---

## Tech Stack

| Technology           | Purpose                          |
| -------------------- | -------------------------------- |
| React 18             | UI framework                     |
| TypeScript           | Type safety                      |
| Vite                 | Build tool & dev server          |
| React Router v6      | Client-side routing (HashRouter) |
| React Hook Form      | Form state management            |
| Zod                  | Schema validation                |
| TipTap (ProseMirror) | Rich text editor                 |
| Axios                | HTTP client                      |
| @hello-pangea/dnd    | Drag-and-drop reordering         |
| Lucide React         | Icon library                     |
| React Hot Toast      | Notification toasts              |
| Tailwind CSS         | Utility-first styling            |

---

## Project Structure

```
botlab-cms/
├── index.html              # HTML entry point
├── index.tsx               # React app bootstrap
├── App.tsx                 # Root component with routing
├── types.ts                # Shared TypeScript interfaces/types
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript config
├── metadata.json           # App metadata
│
├── client/                 # API client modules
│   ├── http.ts             # Axios instance with interceptors
│   ├── auth.ts             # Authentication API
│   ├── pages.ts            # Pages CRUD API
│   ├── blogs.ts            # Blogs CRUD API
│   ├── sections.ts         # Sections CRUD API
│   ├── portfolios.ts       # Portfolios CRUD API
│   ├── reports.ts          # Reports CRUD API
│   ├── careers.ts          # Careers/Jobs API
│   ├── caseStudies.ts      # Case Studies API
│   ├── leads.ts            # Leads API
│   ├── contacts.ts         # Contacts API
│   ├── files.ts            # File upload API
│   ├── users.ts            # User management API
│   └── layouts.ts          # Layout (header/footer) API
│
├── components/             # Shared UI components
│   ├── Layout.tsx          # Main layout with sidebar navigation
│   ├── RichTextEditor.tsx  # TipTap rich text editor
│   ├── section/
│   │   ├── ComponentListEditor.tsx  # Dynamic component array manager
│   │   └── ValueEditors.tsx         # Type-specific value editors
│   └── ui/
│       ├── Badge.tsx       # Badge component
│       └── Button.tsx      # Button component
│
├── context/
│   └── AuthContext.tsx     # Authentication context provider
│
├── pages/                  # Page-level components
│   ├── Dashboard.tsx       # Admin dashboard
│   ├── Login.tsx           # Login page
│   ├── blogs/
│   ├── careers/
│   ├── caseStudies/
│   ├── contacts/
│   ├── layouts/
│   ├── leads/
│   ├── pages/
│   ├── portfolio/
│   ├── reports/
│   ├── sections/
│   └── users/
│
└── utils/                  # Utility functions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server running (default: `http://localhost:3006`)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
# Starts dev server at http://localhost:3000
```

### Production Build

```bash
npm run build:prod
```

### Docker (Debug)

```bash
docker-compose -f docker-compose.debug.yml up --build
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3006
GEMINI_API_KEY=your_gemini_key_here
```

---

## Architecture

### Application Flow

```
index.html → index.tsx → App.tsx (AuthProvider + HashRouter)
                              │
                              ├── /login → Login Page
                              │
                              └── ProtectedRoute (requires auth)
                                    │
                                    └── Layout (sidebar + header)
                                          │
                                          ├── / → Dashboard
                                          ├── /pages → Page management
                                          ├── /blogs → Blog management
                                          ├── /sections → Section templates
                                          ├── /portfolios → Portfolio management
                                          ├── /reports → Reports management
                                          ├── /careers → Job management
                                          ├── /case-studies → Case studies
                                          ├── /leads → Lead tracking
                                          ├── /users → User management
                                          ├── /header → Header layouts
                                          └── /footer → Footer layouts
```

### Routing Pattern

The app uses **HashRouter** (`/#/path`) for compatibility with static hosting. All authenticated routes are wrapped in a `ProtectedRoute` component that checks for a valid JWT token in localStorage.

### State Management

- **Authentication State**: React Context (`AuthContext`) with token stored in `localStorage`
- **Form State**: React Hook Form with Zod validation schemas
- **Server Data**: Fetched on component mount via API clients, stored in local component state
- **No global state library** — each page manages its own data lifecycle

### Data Flow Pattern

```
User Action → Form Submit → Zod Validation → API Client → Backend
                                                              │
                                                         Response
                                                              │
                                              Toast Notification + Navigate
```

---

## Authentication

### Flow

1. User navigates to the app
2. `AuthProvider` checks `localStorage` for existing JWT token
3. If no token → redirect to `/login`
4. User submits credentials → `POST /users/login`
5. On success → token stored in `localStorage`, redirect to Dashboard
6. On 401 response (any request) → token cleared, redirect to `/login`

### Token Management

- **Storage**: `localStorage` (key: `token`)
- **Attachment**: Axios request interceptor adds `Authorization: Bearer <token>` to all requests
- **Expiry Handling**: 401 response interceptor clears token and redirects to login

### Protected Routes

All routes except `/login` are wrapped in the `ProtectedRoute` component:

```tsx
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
```

---

## Modules

### Pages Module

**Purpose**: Create and manage website pages composed of reusable sections.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/pages` | PageList | List all pages |
| `/pages/create` | PageEditor | Create new page |
| `/pages/edit/:id` | PageEditor | Edit existing page |

**Features:**

- Dynamic page building with drag-and-drop section reordering
- Add sections from pre-defined section templates
- Status management (draft/published)
- SEO fields (title, description, indexable flag)
- Custom JSON metadata
- Auto-generated slug from page title

**API Endpoints:**

- `GET /pages` — List all pages
- `GET /pages/{id}` — Get page by ID
- `GET /pages/resolved/{id}` — Get page with fully resolved section data
- `POST /pages` — Create page
- `PUT /pages/{id}` — Update page
- `DELETE /pages/{id}` — Delete page

**Data Model:**

```typescript
interface PageDto {
  id: string;
  title: string;
  slug: string;
  sections?: SectionDto[];
  metadata?: Record<string, unknown>;
  isIndexable?: boolean;
  status?: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}
```

---

### Sections Module

**Purpose**: Create reusable section templates that can be added to pages and portfolios.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/sections` | SectionList | List all section templates |
| `/sections/create` | SectionEditor | Create new section |
| `/sections/edit/:id` | SectionEditor | Edit existing section |

**Features:**

- Define section structure with typed components
- Slug validation (kebab-case enforced: `^[a-z0-9-]+$`)
- Type categorization (e.g., "services", "faq", "hero")
- Active/inactive toggle
- Nested component management via ComponentListEditor

**Component Types:**
| Type | Description | Editor |
|---|---|---|
| `text` | Short text string | Text input |
| `richText` | HTML content | TipTap editor |
| `image` | Image URL + metadata | URL input + file upload |
| `video` | Video URL + metadata | URL input + file upload |
| `button` | Label + link | Two-field input |
| `list` | Array of items | Dynamic list with schema inference |

**Data Model:**

```typescript
interface SectionDto {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive?: boolean;
  components: ComponentDto[];
  createdAt: string;
  updatedAt: string;
}

interface ComponentDto {
  name: string;
  slug: string;
  type: "text" | "image" | "video" | "button" | "richText" | "custom" | "list";
  value?: any;
  isVisible: boolean;
}
```

---

### Blogs Module

**Purpose**: Create and manage blog posts with rich content editing.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/blogs` | BlogList | List all blog posts |
| `/blogs/create` | BlogEditor | Create new blog |
| `/blogs/edit/:id` | BlogEditor | Edit existing blog |

**Features:**

- Rich text editor with full formatting (TipTap with blog features enabled)
- Automatic Table of Contents generation from H2/H3 headers
- FAQ section with dynamic question/answer pairs
- Preview image upload
- SEO metadata (title, description, indexable)
- Category assignment
- Status management (draft/published)
- Auto-generated header IDs for anchor linking

**Special Behavior:**

- Content is scanned for H2/H3 headers in real-time to generate TOC
- Header IDs are auto-generated from header text (slugified)
- TOC entries include text, ID, and level (2 or 3)
- Blog content is processed before submission to inject header IDs

**Data Model:**

```typescript
interface BlogDto {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML content
  status: "draft" | "published";
  category: string;
  preview?: string; // Preview image URL
  isIndexable?: boolean;
  metadata?: Record<string, unknown>;
  faqs?: FaqDto[];
  tableOfContent?: TableOfContentDto[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}
```

---

### Portfolios Module

**Purpose**: Manage portfolio/project showcase items (drone show focused).

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/portfolios` | PortfolioList | List all portfolios |
| `/portfolios/create` | PortfolioEditor | Create new portfolio |
| `/portfolios/edit/:id` | PortfolioEditor | Edit existing portfolio |

**Features:**

- Section-based content building (same as Pages)
- Drag-and-drop section reordering
- Drone show specific fields (number of drones, show duration)
- Category selection from predefined list
- Location field
- SEO metadata support
- Status management (draft/published)

**Available Categories:**

- Pyro, Integrated, Indoor, Outdoor, Corporate, Wedding, Festival, Government, Sports

**Data Model:**

```typescript
interface PortfolioDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  isIndexable?: boolean;
  sections: SectionDto[];
  metadata?: Record<string, unknown>;
  status?: "draft" | "published";
  numberOfDrones?: number;
  showDuration?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}
```

---

### Reports Module

**Purpose**: Manage downloadable report documents.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/reports` | ReportList | List all reports |
| `/reports/create` | ReportEditor | Create new report |
| `/reports/edit/:id` | ReportEditor | Edit existing report |

**Features:**

- Report metadata: title, category, year, date
- File upload for report document (PDF/document)
- S3 URL storage for uploaded files

**Data Model:**

```typescript
interface ReportDto {
  id: string;
  title: string;
  category?: string;
  year: string;
  date: string;
  fileUrl: string; // S3 URL to uploaded file
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}
```

---

### Careers Module

**Purpose**: Manage job postings and view applications.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/careers` | JobList | List all job postings |
| `/careers/create` | JobEditor | Create new job |
| `/careers/edit/:id` | JobEditor | Edit existing job |

**Features:**

- Comprehensive job posting fields
- Application tracking per job
- Status management (draft/published/closed)
- Rich text for descriptions, responsibilities, and skills
- Application deadline management
- Work mode specification (remote, hybrid, onsite)

**Data Model:**

```typescript
interface JobDto {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string;
  type: string; // Full-time, Part-time, Contract
  experience: string;
  workMode?: string;
  description: string; // About the role (HTML)
  responsibilities: string; // Key responsibilities (HTML)
  skills: string; // Skills/competencies (HTML)
  status: "draft" | "published" | "closed";
  isActive: boolean;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Application Data:**

```typescript
interface ApplicationDto {
  id: string;
  jobId: string;
  name: string;
  email: string;
  mobileNumber: string;
  currentLocation: string;
  resumeUrl: string;
  totalExperience: string;
  relevantExperience: string;
  currentEmployer?: string;
  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod: string;
  highestQualification: string;
  portfolioLink?: string;
  createdAt: string;
}
```

---

### Case Studies Module

**Purpose**: Manage case study documents with file and preview management.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/case-studies` | CaseStudyList | List all case studies |
| `/case-studies/create` | CaseStudyEditor | Create new case study |
| `/case-studies/edit/:id` | CaseStudyEditor | Edit existing case study |

**Features:**

- PDF document upload and management
- Preview image for thumbnails
- Category classification
- Date assignment
- Optional description
- Active/inactive toggle

**Data Model:**

```typescript
interface CaseStudyDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  fileUrl: string; // PDF URL
  preview: string; // Thumbnail image URL
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

### Layouts Module

**Purpose**: Manage header and footer layout configurations.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/header` | LayoutList (type=header) | List header layouts |
| `/header/create` | LayoutEditor (type=header) | Create header |
| `/header/edit/:id` | LayoutEditor (type=header) | Edit header |
| `/footer` | LayoutList (type=footer) | List footer layouts |
| `/footer/create` | LayoutEditor (type=footer) | Create footer |
| `/footer/edit/:id` | LayoutEditor (type=footer) | Edit footer |

**Features:**

- Shared editor for both header and footer (differentiated by `type` prop)
- Component-based layout building (same component system as sections)
- Active/inactive toggle
- Slug-based identification

**Data Model:**

```typescript
interface LayoutDto {
  id: string;
  name: string;
  slug: string;
  type: "header" | "footer";
  isActive?: boolean;
  components: ComponentDto[];
  createdAt: string;
  updatedAt: string;
}
```

---

### Leads Module

**Purpose**: View and manage captured leads with UTM tracking data.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/leads` | LeadList | List/filter/export leads |

**Features:**

- Read-only lead management (leads are captured from public forms)
- Multi-field search filtering (name, email, phone, company, event location, form name)
- CSV export with optional date range filtering
- Lead detail modal with full captured data
- UTM tracking data display
- Event information tracking

**Data Model:**

```typescript
interface LeadDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  message?: string;
  utmRaw?: string;
  pageUrl?: string;
  eventType?: string;
  eventLocation?: string;
  companyName?: string;
  eventDate?: string;
  formName?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Contacts Module

**Purpose**: View contact form submissions.

**Routes:**
| Route | Component | Description |
|---|---|---|
| (Accessible via API) | ContactList | List contacts |

**Features:**

- Read-only contact management
- View submitted contact form entries
- Delete individual contacts

**Data Model:**

```typescript
interface ContactDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### Users Module

**Purpose**: Manage CMS admin users.

**Routes:**
| Route | Component | Description |
|---|---|---|
| `/users` | UserList | List all users |
| `/users/register` | RegisterUser | Register new user |

**Features:**

- User listing with search/filter
- New user registration
- User deletion with confirmation
- Avatar display with initials

**Data Model:**

```typescript
interface UserDto {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### File Uploads Module

**Purpose**: Handle media asset uploads to backend storage (S3).

**API Endpoints:**

- `POST /files/upload/image` — Upload image file
- `POST /files/upload/video` — Upload video file
- `POST /files/upload` — Upload generic file (PDFs, documents)

**Response:**

```typescript
interface FileUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  type: string;
}
```

**Usage**: Integrated into RichTextEditor (inline images), ValueEditors (image/video components), BlogEditor (preview images), ReportEditor (report PDFs), and CaseStudyEditor (case study PDFs and previews).

---

## Component Architecture

### Layout Component

The main `Layout` component provides:

- **Sidebar Navigation**: 12-item menu with icons for all modules
- **Responsive Design**: Collapsible sidebar on mobile with hamburger toggle
- **Header Bar**: Displays user info and mobile menu toggle
- **Content Area**: Scrollable main area using React Router `<Outlet />`
- **Visual Design**: Dark slate sidebar (slate-900), blue accent for active items

### Rich Text Editor

Built on **TipTap** (ProseMirror-based), the editor supports:

- Text formatting (bold, italic, underline)
- Headings (H1, H2, H3 — blog mode only)
- Lists (bullet and ordered)
- Links (add/edit/remove with URL dialog)
- Image upload (file picker → API upload → insert)
- Tables (insert, add/delete rows/columns — blog mode only)
- Bubble menu for quick link editing on selection

**Two Modes:**

- **Standard**: Basic formatting for section components
- **Blog Mode** (`enableBlogFeatures=true`): Full feature set with headings and tables

### Section Component System

The section/component system is the core content building mechanism:

```
Page/Portfolio
  └── Sections[] (drag-and-drop reorderable)
        └── Components[] (typed value editors)
              └── Value (type-specific editor)
```

**ComponentListEditor**: Manages an array of components within a section using `useFieldArray`. Supports add, remove, and reorder operations.

**ValueEditors**: Polymorphic editor that renders the appropriate UI based on component type:

| Component Type | Editor UI                                                |
| -------------- | -------------------------------------------------------- |
| `text`         | Simple text input                                        |
| `richText`     | TipTap rich text editor                                  |
| `image`        | URL input + file uploader + alt/caption fields + preview |
| `video`        | URL input + file uploader + caption field + preview      |
| `button`       | Label + link two-column input                            |
| `list`         | Dynamic item list with auto-inferred schema              |

**List Schema Inference**: The list editor automatically detects field types from the first item:

- HTML content → richText editor
- String > 60 chars → textarea
- Contains "url" → image/video editor
- Contains "link" → button editor
- Array values → nested list

---

## API Client Layer

### HTTP Configuration (`client/http.ts`)

All API communication goes through a configured Axios instance:

```typescript
const http = axios.create({
  baseURL: VITE_API_URL || "http://localhost:3006",
  headers: { "Content-Type": "application/json" },
});
```

**Interceptors:**

- **Request**: Attaches JWT token from localStorage as `Authorization: Bearer <token>`
- **Response**: On 401, clears token and redirects to `/#/login`

### API Client Pattern

Each module follows a consistent pattern:

```typescript
// Example: client/pages.ts
export const pagesApi = {
  getAll: () => http.get("/pages").then((r) => r.data),
  getById: (id: string) => http.get(`/pages/${id}`).then((r) => r.data),
  create: (data: CreatePageDto) =>
    http.post("/pages", data).then((r) => r.data),
  update: (id: string, data: CreatePageDto) =>
    http.put(`/pages/${id}`, data).then((r) => r.data),
  delete: (id: string) => http.delete(`/pages/${id}`).then((r) => r.data),
};
```

### Complete API Endpoint Reference

| Module       | Base Path       | Operations                                                                                            |
| ------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| Auth         | `/users`        | `POST /login`                                                                                         |
| Pages        | `/pages`        | CRUD + `GET /resolved/{id}`                                                                           |
| Blogs        | `/blogs`        | CRUD                                                                                                  |
| Sections     | `/sections`     | CRUD                                                                                                  |
| Portfolios   | `/portfolios`   | CRUD + `GET /slug/{slug}`                                                                             |
| Reports      | `/reports`      | CRUD                                                                                                  |
| Careers      | `/careers`      | `GET /admin/jobs`, `POST /jobs`, `PUT /jobs/{id}`, `DELETE /jobs/{id}`, `GET /jobs/{id}/applications` |
| Case Studies | `/case-studies` | `GET /admin/all`, CRUD                                                                                |
| Leads        | `/leads`        | `GET /`, `GET /{id}`, `DELETE /{id}`                                                                  |
| Contacts     | `/contacts`     | `GET /`, `GET /{id}`, `DELETE /{id}`                                                                  |
| Users        | `/users`        | `GET /`, `POST /register`, `DELETE /{id}`                                                             |
| Layouts      | `/layouts`      | CRUD + `GET ?type={type}` + `GET /slug/{slug}`                                                        |
| Files        | `/files`        | `POST /upload/image`, `POST /upload/video`, `POST /upload`                                            |

---

## Forms & Validation

### Pattern

All editor forms use **React Hook Form** with **Zod** schemas:

```typescript
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Must be kebab-case'),
  status: z.enum(['draft', 'published']),
  // ...
});

const { register, handleSubmit, control, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### Common Validation Rules

| Field      | Rule                                        |
| ---------- | ------------------------------------------- |
| Title/Name | Required, min 1 character                   |
| Slug       | Required, kebab-case regex (`^[a-z0-9-]+$`) |
| Status     | Enum: draft, published (or closed for jobs) |
| Email      | Valid email format                          |
| URL        | Valid URL format                            |

### Auto-Slug Generation

Page, blog, and portfolio editors auto-generate slugs from titles:

- Converts to lowercase
- Replaces spaces with hyphens
- Only triggers on new creation (not edit)

---

## Rich Text Editor

### Technology

Built on **TipTap** — a headless, framework-agnostic rich text editor built on ProseMirror.

### Extensions Used

- `StarterKit` — Basic editing features
- `Underline` — Underline formatting
- `Link` — Hyperlink support with auto-detection
- `Image` — Inline image support
- `Table`, `TableRow`, `TableHeader`, `TableCell` — Table support (blog mode)

### Image Upload Flow

1. User clicks image button in toolbar
2. File picker opens (accepts `image/*`)
3. Selected file uploaded via `filesApi.uploadImage()`
4. Returned URL inserted into editor content
5. Toast notification confirms success/failure

### Blog-Specific Features

When `enableBlogFeatures` is true:

- Heading buttons (H1, H2, H3) appear in toolbar
- Table management tools enabled
- Used exclusively in BlogEditor component

---

## Section Component System

### Concept

Sections are the **building blocks** of pages and portfolios. A section is a template with a defined structure (components), which can be instantiated on multiple pages.

### Workflow

1. **Define Section Template** (`/sections/create`)
   - Set name, slug, type category
   - Define component structure (what fields the section has)

2. **Use Section in Page/Portfolio**
   - Add section template to page via dropdown
   - Section is cloned with all component definitions
   - Fill in component values (text, images, etc.)
   - Reorder sections via drag-and-drop

3. **Component Value Editing**
   - Each component type has a specialized editor
   - Values are stored inline with the page/portfolio data

### Component Value Structures

**Image/Video:**

```json
{
  "url": "https://cdn.example.com/image.jpg",
  "alt": "Description",
  "caption": "Optional caption"
}
```

**Button:**

```json
{
  "text": "Click Me",
  "link": "/target-page"
}
```

**List:**

```json
[
  { "title": "Item 1", "description": "...", "image": { "url": "..." } },
  { "title": "Item 2", "description": "...", "image": { "url": "..." } }
]
```

---

## Environment Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "0.0.0.0", // Accessible from all interfaces
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

### Environment Variables

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3006` |

### Path Alias

The `@` alias resolves to the project root, allowing imports like:

```typescript
import { SomeType } from "@/types";
```

---

## Deployment

### Build Output

```bash
npm run build:prod
# Output: dist/ directory
```

The production build creates a static SPA bundle in `dist/` that can be served by any static file server (Nginx, S3, Netlify, etc.).

### Routing Note

The app uses **HashRouter** (`/#/path`), which means:

- All routes are client-side only (no server-side routing config needed)
- The server always serves `index.html` for all paths
- Deep linking works without special server configuration

---

## Dashboard

The Dashboard (`/`) provides an at-a-glance overview:

**Statistics Cards (8):**

- Total Pages count
- Total Sections count
- Total Blogs count
- Total Portfolios count
- Total Jobs count
- Total Case Studies count
- Total Reports count
- Total Leads count

**Quick Actions (6):**

- Create Page → `/pages/create`
- Create Section → `/sections/create`
- Create Blog → `/blogs/create`
- Add Portfolio → `/portfolios/create`
- Post Job → `/careers/create`
- Add Case Study → `/case-studies/create`

All statistics are fetched from their respective API endpoints on page load.

---

## Common Patterns

### List Pages

All list pages follow the same pattern:

1. Fetch data on mount via API client
2. Display in table format with columns
3. Search/filter functionality (client-side)
4. Actions column with edit/delete buttons
5. Delete requires confirmation dialog
6. Toast notifications for success/error

### Editor Pages

All editor pages follow the same pattern:

1. Check URL for `:id` param → edit mode vs. create mode
2. If edit mode, fetch existing data and populate form
3. Form validated with Zod schema via React Hook Form
4. Submit calls create or update API
5. On success → toast + navigate back to list
6. On error → toast with error message

### Error Handling

- API errors caught in try/catch blocks
- Error messages displayed via `react-hot-toast`
- 401 responses trigger automatic logout
- Loading states shown during API calls

---

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- All API requests authenticated via Bearer token
- 401 responses auto-clear credentials
- No sensitive data exposed in client-side code
- File uploads validated by backend (file type, size)
- Form inputs validated with Zod before submission

---

## Browser Support

Built with Vite and modern React (18+), supporting:

- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 88+
