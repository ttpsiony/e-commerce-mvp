async function main() {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }

  const toolArgs = JSON.parse(Buffer.concat(chunks).toString())

  // Extract the file path
  const readPath = toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || ''

  // Check
  const isForbidden = /\/\.env[^/]*$/.test(readPath)

  if (isForbidden) {
    console.error('You cannot read the .env* file')
    process.exit(2)
  }
}

main()
