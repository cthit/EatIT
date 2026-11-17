export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { startMenuScheduler } = await import('./lib/menu-scheduler');
  startMenuScheduler();
}
