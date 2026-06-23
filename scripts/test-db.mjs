import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const passwordHash = hashPassword('test123');
  const user = await prisma.user.create({
    data: {
      username: 'testuser2',
      passwordHash,
      wechatOpenid: `user_testuser2_${Date.now()}`,
      nickname: '测试用户',
      source: 'username',
    },
  });
  console.log('User created:', { id: Number(user.id), username: user.username, nickname: user.nickname });

  const found = await prisma.user.findUnique({ where: { username: 'testuser2' } });
  console.log('Found:', found ? { id: Number(found.id) } : 'null');

  await prisma.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
