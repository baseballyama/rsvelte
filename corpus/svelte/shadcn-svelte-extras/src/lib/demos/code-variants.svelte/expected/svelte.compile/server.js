import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';

export default function Code_variants($$renderer) {
	$$renderer.push(`<div class="flex w-full flex-col gap-4 p-6">`);

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, {
			lang: 'typescript',
			class: 'w-full',
			variant: 'secondary',
			hideLines: true,
			code: `import * as Code from "$lib/components/ui/code";`,
			children: ($$renderer) => {
				if (Code.CopyButton) {
					$$renderer.push('<!--[-->');
					Code.CopyButton($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, {
			lang: 'svelte',
			class: 'w-full',
			variant: 'secondary',
			hideLines: true,
			code: `<Button variant="outline">
	Button
</Button>`,

			children: ($$renderer) => {
				if (Code.CopyButton) {
					$$renderer.push('<!--[-->');
					Code.CopyButton($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}