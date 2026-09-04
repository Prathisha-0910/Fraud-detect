// pdf-parse is a Node-only library (it shells out to Node Buffer APIs),
// so it cannot run in the browser or on the Edge runtime — this route must
// stay on the Node.js runtime.
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const arrayBuffer = await req.arrayBuffer()

    if (arrayBuffer.byteLength === 0) {
      return Response.json({ error: 'No PDF data received.' }, { status: 400 })
    }
    // 10MB guard so a huge upload can't hang the server
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
      return Response.json({ error: 'PDF is too large (max 10MB).' }, { status: 413 })
    }

    // Dynamic import keeps pdf-parse out of the edge/client bundle graph.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
    const buffer = Buffer.from(arrayBuffer)
    const result = await pdfParse(buffer)

    return Response.json({ text: result.text ?? '', pageCount: result.numpages ?? null })
  } catch (err) {
    console.error('PDF extraction failed:', err)
    return Response.json(
      { error: 'Could not read this PDF. It may be corrupted, password-protected, or a scanned image with no embedded text.' },
      { status: 422 }
    )
  }
}
