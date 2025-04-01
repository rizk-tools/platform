import { mkdir } from "node:fs/promises"
import path from "node:path"

const baseDir = "../proto/opentelemetry/proto/"

const files = [
  // Trace proto files
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/collector/trace/v1/trace_service.proto",
    path: "collector/trace/v1/trace_service.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/trace/v1/trace.proto",
    path: "trace/v1/trace.proto",
  },

  // Logs proto files
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/collector/logs/v1/logs_service.proto",
    path: "collector/logs/v1/logs_service.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/logs/v1/logs.proto",
    path: "logs/v1/logs.proto",
  },

  // Metrics proto files
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/collector/metrics/v1/metrics_service.proto",
    path: "collector/metrics/v1/metrics_service.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/metrics/v1/metrics.proto",
    path: "metrics/v1/metrics.proto",
  },

  // Common proto files
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/common/v1/common.proto",
    path: "common/v1/common.proto",
  },
  {
    url: "https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/main/opentelemetry/proto/resource/v1/resource.proto",
    path: "resource/v1/resource.proto",
  },
]

/**
 * Calculates the relative path from source file to target file
 */
function calculateRelativePath (sourcePath: string, targetPath: string): string {
  // Split paths into segments
  const sourceSegments = sourcePath.split("/").slice(0, -1) // Remove filename
  const targetSegments = targetPath.split("/")

  // Find number of directories to go up
  const upLevels = sourceSegments.length

  // Create proper relative path
  if (upLevels === 0) {
    return targetPath
  }

  // Generate the correct number of "../" and append target path
  return Array(upLevels).fill("..").join("/") + "/" + targetPath
}

/**
 * Fixes import paths in the proto files to be relative to our project structure
 */
function fixImportPaths (content: string, currentFilePath: string): string {
  return content.replace(
    /import\s+"opentelemetry\/proto\/(.*?)"/g,
    (match, importPath) => {
      const relativePath = calculateRelativePath(currentFilePath, importPath);
      return `import "${relativePath}"`;
    }
  );
}

for (const file of files) {
  const res = await fetch(file.url)
  if (!res.ok) {
    console.error(`Failed to download: ${file.url}`)
    continue
  }

  let content = await res.text()

  // Fix import paths
  content = fixImportPaths(content, file.path)

  const dir = file.path.split("/").slice(0, -1).join("/")
  await mkdir(baseDir + dir, { recursive: true })
  await Bun.write(baseDir + file.path, content)
  console.log(`✅ Saved: ${file.path} with fixed imports`)
}