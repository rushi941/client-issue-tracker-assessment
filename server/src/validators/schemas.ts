import { z } from "zod";
import { IssueCategory, IssueSeverity, IssueStatus } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  websiteId: z.string().min(1),
  category: z.nativeEnum(IssueCategory),
  severity: z.nativeEnum(IssueSeverity).optional(),
});

export const clientUpdateIssueSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z.nativeEnum(IssueCategory).optional(),
});

export const managerUpdateIssueSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z.nativeEnum(IssueCategory).optional(),
  severity: z.nativeEnum(IssueSeverity).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  assigneeId: z.string().nullable().optional(),
});

/** @deprecated Use clientUpdateIssueSchema or managerUpdateIssueSchema */
export const updateIssueSchema = managerUpdateIssueSchema;

export const commentSchema = z.object({
  body: z.string().min(1).max(5000),
  isManagerResponse: z.boolean().optional(),
});

export const aiSuggestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const aiResponseSchema = z.object({
  issueId: z.string().min(1),
});
