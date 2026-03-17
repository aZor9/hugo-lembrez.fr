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
