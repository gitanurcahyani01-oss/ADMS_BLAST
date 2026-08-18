import prisma from '../prisma.js';

let isBootstrapping = false;

export async function bootstrapDatabase() {
  if (isBootstrapping) return { success: false, message: 'Bootstrap already in progress' };
  isBootstrapping = true;

  try {
    console.log('🔄 Testing MySQL connection & initial seed...');
    const { runSeed } = await import('../../prisma/seed.js');
    await runSeed(false);

    // Reset stuck campaigns from RUNNING to PAUSED on boot
    await prisma.blastCampaign.updateMany({
      where: { status: 'RUNNING' },
      data: { status: 'PAUSED' },
    });
    console.log('✅ Reset stuck RUNNING campaigns to PAUSED on boot.');

    return { success: true, message: 'Koneksi MySQL berhasil & akun admin terverifikasi!' };
  } catch (error) {
    console.error('Bootstrap error:', error.message);
    return { success: false, error: error.message };
  } finally {
    isBootstrapping = false;
  }
}
