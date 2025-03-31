import { mkdir } from "node:fs/promises"

const baseDir = "../proto/opentelemetry/proto/"

const files = [
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/collector/trace/v1/trace_service.proto",
    path: "collector/trace/v1/trace_service.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/trace/v1/trace.proto",
    path: "trace/v1/trace.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/common/v1/common.proto",
    path: "common/v1/common.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/resource/v1/resource.proto",
    path: "resource/v1/resource.proto",
  },
]

for (const file of files) {
  const res = await fetch(file.url)
  if (!res.ok) {
    console.error(`Failed to download: ${file.url}`)
    continue
  }

  const content = await res.text()
  const dir = file.path.split("/").slice(0, -1).join("/")
  await mkdir(dir, { recursive: true })
  await Bun.write(baseDir + file.path, content)
  console.log(`✅ Saved: ${file.path}`)
}