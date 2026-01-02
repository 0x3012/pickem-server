import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const IMAGE_API = 'https://img.gamescorekeeper.com/logo/participant';

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

const CACHE_DAYS = 460;

export async function fetchAndCacheTeamLogo(
  participantId: bigint,
): Promise<string | null> {
  if (!participantId) return null;

  const baseDir = path.join(process.cwd(), 'public', 'teams');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

   const existing = fs
    .readdirSync(baseDir)
    .find(f => f.startsWith(`${participantId}.`));

  if (existing) {
    const filePath = path.join(baseDir, existing);
    const stats = fs.statSync(filePath);
    const ageDays =
      (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    if (ageDays < CACHE_DAYS) {
      return `/teams/${existing}`;
    }
  }

  // ⬇️ Download logo
  const response = await axios.get(
    `${IMAGE_API}/${participantId.toString()}`,
    {
      responseType: 'arraybuffer',
      headers: {
        Authorization: process.env.GAMESCORE_IMAGE_TOKEN!,
        Accept: 'image/*',
      },
      timeout: 15_000,
      validateStatus: s => s === 200,
    },
  );

  const contentType = response.headers['content-type'];
  if (!contentType || !contentType.startsWith('image/')) return null;

  const ext = MIME_TO_EXT[contentType] ?? 'png';
  const filename = `${participantId}.${ext}`;
  const filePath = path.join(baseDir, filename);

  fs.writeFileSync(filePath, response.data);

  return `/teams/${filename}`;
}
