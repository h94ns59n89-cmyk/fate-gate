import { createHash } from 'crypto';
import { withMiddleware } from '@/lib/middleware';
import { wechatCode2Session } from '@/lib/wechat';
import { getEnv } from '@/lib/env';
import { success, error } from '@/lib/api-response';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/db/client';

export const POST = withMiddleware(async (req) => {
  try {
    const body = await req.json();
    const { code, nickname, avatar_url, invite_code } = body;

    if (!code) {
      return error(100104, '缺少必填字段: code', 400);
    }

    const wxResult = await wechatCode2Session(code);
    const openidHash = createHash('sha256').update(wxResult.openid).digest('hex');

    const user = await prisma.user.upsert({
      where: { wechatOpenid: wxResult.openid },
      update: {
        nickname: nickname ?? undefined,
        avatarUrl: avatar_url ?? undefined,
        lastLoginAt: new Date(),
      },
      create: {
        wechatOpenid: wxResult.openid,
        unionId: wxResult.unionid ?? null,
        nickname: nickname ?? null,
        avatarUrl: avatar_url ?? null,
        source: 'direct',
      },
    });

    if (invite_code && user.inviteBy == null) {
      const inviterId = parseInt(invite_code.replace('u_', ''), 10);
      if (!isNaN(inviterId) && BigInt(inviterId) !== user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { inviteBy: BigInt(inviterId) },
        });
        await prisma.sharingRecord.create({
          data: {
            userId: BigInt(inviterId),
            shareType: 'direct_invite',
            invitedUserId: user.id,
            platform: 'h5',
          },
        });
      }
    }

    const env = getEnv();
    const tokenPayload = { user_id: user.id, openid_hash: openidHash, iat: Date.now() };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return success({
      token: `eyJhbGciOiJIUzI1NiJ9.${token}.sig`,
      expires_in: env.jwt.expiresIn,
      token_type: 'Bearer' as const,
      user: {
        id: Number(user.id),
        nickname: user.nickname,
        avatar_url: user.avatarUrl,
        is_new_user: user.createdAt.getTime() === user.updatedAt.getTime(),
        has_report: false,
        report_count: 0,
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return error(err.code, err.message, err.httpStatus);
    }
    throw err;
  }
});
