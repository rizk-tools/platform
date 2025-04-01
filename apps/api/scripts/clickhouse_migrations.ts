import clickhouse from "@/lib/clickhouse"
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'path'

const MIGRATIONS_DIR = join(__dirname, 'migrations')

const splitSqlStatements = (sql: string): string[] => {
  // Split on semicolons, but ignore semicolons within parentheses
  const statements: string[] = []
  let currentStatement = ''
  let parenthesesCount = 0

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]

    if (char === '(') parenthesesCount++
    else if (char === ')') parenthesesCount--

    if (char === ';' && parenthesesCount === 0) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim())
      }
      currentStatement = ''
    } else {
      currentStatement += char
    }
  }

  // Add the last statement if it exists
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim())
  }

  return statements.filter(stmt => stmt.length > 0)
}

const run = async () => {
  const files = (await readdir(MIGRATIONS_DIR)).sort()

  for (const file of files) {
    console.log(`🔁 Running migration: ${file}`)
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    const statements = splitSqlStatements(sql)

    for (const statement of statements) {
      try {
        await clickhouse.command({ query: statement })
        console.log('✅ Executed statement successfully')
      } catch (error) {
        console.error('❌ Failed to execute statement:', statement)
        throw error
      }
    }
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