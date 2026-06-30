function isBuildProcess() {
  return process.argv.some((arg, index) => {
    return (
      arg.includes("next") &&
      process.argv[index + 1] === "build"
    );
  });
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || isBuildProcess()) {
    return;
  }

  const { startNaverMailSyncWorker } = await import(
    "@/lib/mail/startNaverMailSyncWorker"
  );

  startNaverMailSyncWorker();
}
