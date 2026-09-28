import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from '$lib/components/custom/docs/Code.svelte';
import CliCode from '$lib/components/custom/docs/CliCode.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft, ExternalLink } from '@lucide/svelte';
import { resolve } from '$app/paths';

import {
	serverCode,
	envCode,
	clientBasicCode,
	userUpdateCode,
	caveatsCode
} from './code.ts';

var root = $.from_html(`Open realtime workspace <!>`, 1);
var root_1 = $.from_html(`<!> Back to Slash Command`, 1);

var root_2 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Realtime Collaboration</h1> <p class="lead">Add multi-user editing to Edra with <a href="https://tiptap.dev/docs/hocuspocus/getting-started/overview" target="_blank" rel="noreferrer">Hocuspocus</a> + Yjs. Not bundled by default — opt-in via <code>collaborative</code>.</p> <div class="not-prose my-6 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-4"><div class="flex flex-1 flex-col gap-2"><span class="text-sm font-medium">Try it live</span> <span class="text-sm text-muted-foreground">Open the realtime workspace and share the URL with another tab or user.</span></div> <!></div> <hr class="my-6"/> <h2>1. How it works</h2> <ul class="mt-4 list-disc space-y-1 pl-6"><li><strong>Yjs</strong> CRDT keeps one <code>Y.Doc</code> per room, synced over WebSocket.</li> <li><strong>Hocuspocus</strong> is the WebSocket server that holds/auths/persists rooms.</li> <li><strong>Edra</strong> with <code>collaborative: true</code> disables StarterKit history
			(undo/redo) — Yjs owns it. Just add <code>Collaboration</code> + <code>CollaborationCaret</code>.</li></ul> <h2>2. Install</h2> <div class="my-4"><!></div> <p class="text-sm text-muted-foreground">Peer deps: <code>yjs</code>, <code>@hocuspocus/provider</code> (client) and <code>@hocuspocus/server</code> (server).</p> <h2>3. Server</h2> <p>Minimal standalone Hocuspocus server. Host it anywhere Node runs.</p> <div class="my-4"><!></div> <p>See <a href="https://tiptap.dev/docs/hocuspocus/getting-started/overview" class="px-0! text-blue-500 underline!" target="_blank">Hocuspocus docs</a> for auth, persistence (DB/Redis), and scaling options.</p> <h3>Environment</h3> <div class="my-4"><!></div> <h2>4. Client</h2> <p>Create the <code>Y.Doc</code> + <code>HocuspocusProvider</code> on the browser only, then pass
		them to <code>createEditor</code> with <code>collaborative: true</code>.</p> <div class="my-4"><!></div> <h2>5. User identity (name & color)</h2> <p>Other cursors show <code></code>. Update at runtime:</p> <div class="my-4"><!></div> <h2>6. Caveats</h2> <div class="my-4"><!></div> <ul class="list-disc space-y-1 pl-6"><li>Create the editor outside <code>onMount</code> (guard with <code>browser</code>) so Tiptap's
			Svelte effects have a valid lifecycle.</li> <li>Clean up with <code>editor.destroy() / provider.destroy() / ydoc.destroy()</code> on unmount.</li> <li>One room = one <code>name</code> passed to <code>HocuspocusProvider</code>. Use auth tokens
			per user if needed.</li></ul> <h2>7. Headless flavor</h2> <p>Same idea with <code>createEditor</code> from <code>$lib/edra/headless/index.js</code> — also accepts <code></code>.</p> <div class="mt-12 flex"><!></div></article>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var article = root_2();

	$.head('1s9mxaq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Realtime Collaboration | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 4);
	var node = $.sibling($.child(div), 2);

	{
		let $0 = $.derived(() => resolve('/realtime'));

		Button(node, {
			get href() {
				return $.get($0);
			},
			size: 'xs',
			class: 'nodefault',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment = root();
				var node_1 = $.sibling($.first_child(fragment));

				ExternalLink(node_1, {});
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 10);
	var node_2 = $.child(div_1);

	CliCode(node_2, { type: 'collaboration' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 8);
	var node_3 = $.child(div_2);

	Code(node_3, {
		get code() {
			return serverCode;
		},
		language: 'typescript'
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 6);
	var node_4 = $.child(div_3);

	Code(node_4, {
		get code() {
			return envCode;
		},
		language: 'bash'
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 6);
	var node_5 = $.child(div_4);

	Code(node_5, {
		get code() {
			return clientBasicCode;
		},
		language: 'typescript'
	});

	$.reset(div_4);

	var p = $.sibling(div_4, 4);
	var code = $.sibling($.child(p));

	code.textContent = '{ name, color }';
	$.next();
	$.reset(p);

	var div_5 = $.sibling(p, 2);
	var node_6 = $.child(div_5);

	Code(node_6, {
		get code() {
			return userUpdateCode;
		},
		language: 'typescript'
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 4);
	var node_7 = $.child(div_6);

	Code(node_7, {
		get code() {
			return caveatsCode;
		},
		language: 'typescript'
	});

	$.reset(div_6);

	var p_1 = $.sibling(div_6, 6);
	var code_1 = $.sibling($.child(p_1), 5);

	code_1.textContent = '{ collaborative: true, extensions: [...] }';
	$.next();
	$.reset(p_1);

	var div_7 = $.sibling(p_1, 2);
	var node_8 = $.child(div_7);

	{
		let $0 = $.derived(() => resolve('/docs/extensions/slash-command'));

		Button(node_8, {
			get href() {
				return $.get($0);
			},
			variant: 'outline',
			class: 'gap-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_9 = $.first_child(fragment_1);

				ArrowLeft(node_9, { class: 'size-4' });
				$.next();
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_7);
	$.reset(article);
	$.append($$anchor, article);
	$.pop();
}