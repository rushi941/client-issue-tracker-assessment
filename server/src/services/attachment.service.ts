import { attachmentRepository } from "../repositories/attachment.repository";
import { issueService } from "./issue.service";
import { Role } from "@prisma/client";
import { AppError } from "../utils/app-error";

export class AttachmentService {
  async listForIssue(issueId: string, userId: string, role: Role) {
    await issueService.getById(issueId, userId, role);
    const attachments = await attachmentRepository.findByIssueId(issueId);
    return attachments;
  }

  uploadNotImplemented() {
    throw new AppError(
      501,
      "Attachment upload is a planned future enhancement. The attachments table and list endpoint are in place.",
    );
  }
}

export const attachmentService = new AttachmentService();
