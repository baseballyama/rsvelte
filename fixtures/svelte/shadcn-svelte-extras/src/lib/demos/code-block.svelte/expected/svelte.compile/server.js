import * as $ from 'svelte/internal/server';
import { TypeScript } from '$lib/components/icons';
import * as Code from '$lib/components/ui/code';

export default function Code_block($$renderer) {
	const code = `import { defineConfig } from 'jsrepo';
    
export default defineConfig({
    // ...
});`;

	$$renderer.push(`<div class="w-full p-6"><div class="border-border rounded-lg border"><div class="border-border flex h-9 items-center justify-between border-b px-6"><div class="flex items-center gap-2">`);
	TypeScript($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span class="text-sm font-medium">jsrepo.config.ts</span></div></div> `);

	if (Code.Root) {
		$$renderer.push('<!--[-->');
		Code.Root($$renderer, { lang: 'typescript', class: 'w-full border-none', code });
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div></div>`);
}