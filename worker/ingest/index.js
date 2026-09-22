/** Railway cron: ping refresh endpoint or extend with live adapters. */
const url = process.env.ROUTEHIRE_API_URL || "http://localhost:3000";
const secret = process.env.CRON_SECRET;

async function main() {
  const res = await fetch(`${url}/api/v1/jobs/refresh`, {
    method: "POST",
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
  console.log(await res.json());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
