import * as $ from 'svelte/internal/server';
import { Svelte } from '$lib/components/icons';
import * as Code from '$lib/components/ui/code';
import { CopyButton } from '$lib/components/ui/copy-button';

export default function Code_block($$renderer) {
	let code = `\<script\>
    import { ModeWatcher } from "mode-watcher";    
\</script\>

<ModeWatcher/>`;

	$$renderer.push(`<div class="border-border bg-card overflow-hidden rounded-lg border"><div class="border-border flex place-items-center justify-between border-b p-2"><div class="flex place-items-center gap-2">`);
	Svelte($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span class="text-muted-foreground font-mono text-sm font-light">src/routes/+layout.svelte</span></div> `);
	CopyButton($$renderer, { text: code, tabindex: -1, class: 'size-7' });
	$$renderer.push(`<!----></div> `);

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, {
			lang: 'svelte',
			class: 'border-none',
			code,
			highlight: [2, 5]
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}