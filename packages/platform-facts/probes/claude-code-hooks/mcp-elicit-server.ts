// A minimal stdio MCP server with one tool, `ask_user`, which asks the client for input with elicitation/create.
// It speaks newline-delimited JSON-RPC by hand, so the probe needs no MCP package.
import { createInterface } from 'node:readline'

type Message = {
  jsonrpc?: string
  id?: number | string
  method?: string
  params?: any
  result?: unknown
  error?: unknown
}

const send = (message: Message) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...message })}\n`)
const waiting = new Map<number | string, (reply: Message) => void>()
let nextId = 1000

createInterface({ input: process.stdin }).on('line', (line) => {
  const message = JSON.parse(line) as Message
  if (message.id !== undefined && !message.method) {
    waiting.get(message.id)?.(message)
    waiting.delete(message.id)
    return
  }
  if (message.id === undefined) return // notifications need no answer
  switch (message.method) {
    case 'initialize':
      send({
        id: message.id,
        result: {
          protocolVersion: message.params?.protocolVersion ?? '2025-06-18',
          capabilities: { tools: {} },
          serverInfo: { name: 'probe', version: '1.0.0' },
        },
      })
      break
    case 'tools/list':
      send({
        id: message.id,
        result: {
          tools: [
            {
              name: 'ask_user',
              description: 'Asks the user for a favorite color through MCP elicitation',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        },
      })
      break
    case 'tools/call': {
      const id = nextId++
      waiting.set(id, (reply) =>
        send({
          id: message.id as number,
          result: { content: [{ type: 'text', text: `elicit result: ${JSON.stringify(reply.result)}` }] },
        }),
      )
      send({
        id,
        method: 'elicitation/create',
        params: {
          message: 'Favorite color?',
          requestedSchema: { type: 'object', properties: { color: { type: 'string' } }, required: ['color'] },
        },
      })
      break
    }
    default:
      send({ id: message.id, result: {} })
  }
})
