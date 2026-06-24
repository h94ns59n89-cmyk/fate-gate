const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.comparison.findFirst({ orderBy: { id: 'desc' } }).then(c => {
  console.log('id:', c?.id);
  console.log('status:', c?.status);
  console.log('userBaziJson:', c?.userBaziJson ? 'present' : 'null');
  console.log('targetBaziJson:', c?.targetBaziJson ? 'present' : 'null');
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
