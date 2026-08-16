---
"@rsvelte/language-server": patch
---

Keep serving after an undecodable LSP message. `lsp_server`'s stdio transport ends its reader thread on the first frame whose body will not deserialize, which closed the connection and took the server down — one malformed message from any client, extension or proxy in the chain and every open document lost its language features. The body of such a frame has already been consumed in full, so the stream is still framed correctly; the message is now dropped with a warning and the server keeps reading. A malformed *header* stays fatal, because the reader no longer knows where the next frame begins.
