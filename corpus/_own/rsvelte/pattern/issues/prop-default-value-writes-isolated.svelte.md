# `prop-default-value-writes-isolated.svelte`

**Issue:** #4194

The same four control defaults with no diverging neighbour. One unparseable fragment makes the client printer fall back to the text path for the WHOLE program (`RSVELTE_CLIENT_TO_OXC_DEBUG` prints `CLIENT_TO_OXC_FALLBACK chunk-parse`), so a broken declaration silently reformats every other declaration in the file — parenthesisation and blank lines included. This file is EQ on the arm where its sibling is not, which is what separates "the neighbour is the cause" from "these four are also wrong". A one-cell-per-file family is blind to this effect by construction.
