export interface ProjectType {
  id: string;
  title: string;
  description: string;
  link: string | null;
  siteUrl: string | null;
  tags: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  url: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileType {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string | null;
  updatedAt: Date;
}

export type CvVariant = "normal" | "reduit";

export interface CvType {
  id: string;
  variant: CvVariant;
  fileUrl: string;
  fileName: string;
  updatedAt: Date | string;
}

export interface HomeSectionSettingsType {
  id: string;
  key: string;
  stacksVisible: boolean;
  stacksTitle: string;
  educationVisible: boolean;
  educationTitle: string;
  educationLeadVisible: boolean;
  educationLeadTitle: string;
  educationLeadSubtitle: string;
  updatedAt: Date;
}

export interface StackCategoryType {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StackItemType {
  id: string;
  techId: string;
  label: string;
  categoryId: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StackCategoryWithItemsType extends StackCategoryType {
  items: StackItemType[];
}

export interface EducationItemType {
  id: string;
  title: string;
  school: string;
  period: string;
  statusLabel: string | null;
  description: string | null;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
