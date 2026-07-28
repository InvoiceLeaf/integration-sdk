import { sha256Hex } from './sha256.js';

export interface AttachmentFingerprintInput {
  uid: number | string;
  fileName: string;
  size?: number;
  sha256?: string;
}

/**
 * Builds a deterministic fingerprint used for dedupe/checkpoint keys.
 *
 * Uses a pure-JS SHA-256 so this module stays loadable in plugin isolates,
 * which have no Node builtins (`node:crypto` would break the neutral bundle).
 */
export function createAttachmentFingerprint(input: AttachmentFingerprintInput): string {
  const material = [
    String(input.uid),
    input.fileName,
    input.size != null ? String(input.size) : '',
    input.sha256 || '',
  ].join(':');

  return sha256Hex(material);
}
