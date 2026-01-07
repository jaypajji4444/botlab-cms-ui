import React from 'react';

// Matching the NestJS DTOs provided

export type ComponentType = 'text' | 'image' | 'video' | 'button' | 'richText' | 'custom' | 'list';

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

export interface ResolvedPageDto extends Omit<PageDto, 'sections'> {
  sections: SectionDto[];
}

// Navigation Item Type
export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}