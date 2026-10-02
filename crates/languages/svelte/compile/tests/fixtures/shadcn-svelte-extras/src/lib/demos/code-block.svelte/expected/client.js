import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TypeScript } from '$lib/components/icons';
import * as Code from '$lib/components/ui/code';

var root = $.from_html(`<div class="w-full p-6"><div class="border-border rounded-lg border"><div class="border-border flex h-9 items-center justify-between border-b px-6"><div class="flex items-center gap-2"><!> <span class="text-sm font-medium">jsrepo.config.ts</span></div></div> <!></div></div>`);

export default function Code_block($$anchor) {
	const code = `import { defineConfig } from 'jsrepo';
    
export default defineConfig({
    // ...
});`;

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	TypeScript(node, { class: 'size-4' });
	$.next(2);
	$.reset(div_3);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	$.component(node_1, () => Code.Root, ($$anchor, Code_Root) => {
		Code_Root($$anchor, { lang: 'typescript', class: 'w-full border-none', code });
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}