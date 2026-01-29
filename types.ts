import React from "react";

// Matching the NestJS DTOs provided

export type ComponentType =
  | "text"
  | "image"
  | "video"
  | "button"
  | "richText"
  | "custom"
  | "list";

export interface ComponentDto {
  name: string;
  slug: string;
  type: ComponentType;
  value?: any;
  isVisible: boolean;
}

export interface CreateSectionDto {
  name: string;
  slug: string;
  type: string; // e.g., 'services', 'faq'
  isActive?: boolean;
  components: ComponentDto[];
}

export interface SectionDto extends CreateSectionDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageDto {
  title: string;
  slug: string;
  sections?: SectionDto[];
  metadata?: Record<string, unknown>;
}

export interface PageDto extends CreatePageDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedPageDto extends Omit<PageDto, "sections"> {
  sections: SectionDto[];
}

// Navigation Item Type
export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export type BlogStatus = "draft" | "published";

export interface FaqDto {
  question: string;
  answer: string;
}

export interface TableOfContentDto {
  text: string;
  id: string;
  level?: number;
}

export interface CreateBlogDto {
  title: string;
  slug: string;
  content: string;
  status: BlogStatus;
  category: string;
  preview?: string;
  isIndexable?: boolean;
  metadata?: Record<string, unknown>;
  faqs?: FaqDto[];
  tableOfContent?: TableOfContentDto[];
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  message?: string;
}

export interface ContactDto extends CreateContactDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}
// Portfolio Types
export interface CreatePortfolioDto {
  title: string;
  slug: string;
  category: string;
  location: string;
  isIndexable?: boolean;
  sections: (CreateSectionDto & { id?: string })[];
  metadata?: Record<string, unknown>;
}

export interface PortfolioDto extends CreatePortfolioDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  sections: SectionDto[];
}

export interface ResolvedPortfolioDto extends PortfolioDto {}

export interface CreateReportDto {
  title: string;
  category?: string;
  year: string;
  date: string;
  fileUrl: string; // S3 URL
}

export interface ReportDto extends CreateReportDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}
