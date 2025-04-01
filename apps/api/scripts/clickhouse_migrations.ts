import clickhouse from "@/lib/clickhouse"
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'path'

const MIGRATIONS_DIR = join(__dirname, 'migrations')

const run = async () => {
  const files = (await readdir(MIGRATIONS_DIR)).sort()

  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    console.log(`🔁 Running migration: ${file}`)
    await clickhouse.command({ query: sql })
  }

  console.log('✅ Migrations complete')
}

// Execute if running directly
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to initialize ClickHouse:', error);
      process.exit(1);
    });
}