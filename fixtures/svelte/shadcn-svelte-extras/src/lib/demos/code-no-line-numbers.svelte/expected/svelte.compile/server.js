import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';

export default function Code_no_line_numbers($$renderer) {
	const code = `import * as Code from "$lib/components/ui/code";`;

	$$renderer.push(`<div class="w-full p-6">`);

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, {
			lang: 'typescript',
			class: 'w-full',
			code,
			hideLines: true,
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