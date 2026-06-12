import { z } from "zod";
import { IssueCategory, IssueSeverity, IssueStatus } from "@prisma/client";
import {
  nonWhitespaceOnly,
  optionalTrimmedText,
  trimmedEmail,
  trimmedId,
  trimmedText,
} from "./string";

export const loginSchema = z.object({
  email: trimmedEmail(),
  password: nonWhitespaceOnly(),
});

export const createIssueSchema = z.object({
  title: trimmedText(3, 200),
  description: trimmedText(10),
  websiteId: trimmedId(),
  category: z.nativeEnum(IssueCategory),
  severity: z.nativeEnum(IssueSeverity).optional(),
});

export const clientUpdateIssueSchema = z.object({
  title: optionalTrimmedText(3, 200),
  description: optionalTrimmedText(10),
  category: z.nativeEnum(IssueCategory).optional(),
});

export const managerUpdateIssueSchema = z.object({
  title: optionalTrimmedText(3, 200),
  description: optionalTrimmedText(10),
  category: z.nativeEnum(IssueCategory).optional(),
  severity: z.nativeEnum(IssueSeverity).optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
});

/** @deprecated Use clientUpdateIssueSchema or managerUpdateIssueSchema */
export const updateIssueSchema = managerUpdateIssueSchema;

export const commentSchema = z.object({
  body: trimmedText(1, 5000),
  isManagerResponse: z.boolean().optional(),
});

export const aiSuggestSchema = z.object({
  title: trimmedText(1),
  description: trimmedText(1),
});

export const aiResponseSchema = z.object({
  issueId: trimmedId(),
});
