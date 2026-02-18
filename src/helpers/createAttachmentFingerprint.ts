import { createHash } from 'crypto';

export interface AttachmentFingerprintInput {
  uid: number | string;
  fileName: string;
  size?: number;
  sha256?: string;
}

/**
 * Builds a deterministic fingerprint used for dedupe/checkpoint keys.
 */
export function createAttachmentFingerprint(input: AttachmentFingerprintInput): string {
  const material = [
    String(input.uid),
    input.fileName,
    input.size != null ? String(input.size) : '',
    input.sha256 || '',
  ].join(':');

  return createHash('sha256').update(material).digest('hex');
}
