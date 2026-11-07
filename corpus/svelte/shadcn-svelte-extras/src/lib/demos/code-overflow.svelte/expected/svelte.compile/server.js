import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';
import codeCode from '$lib/components/ui/code/code.svelte?raw';

export default function Code_overflow($$renderer) {
	$$renderer.push(`<div class="w-full p-6">`);

	if (Code.Overflow) {
		$$renderer.push('<!--[-->');

		Code.Overflow($$renderer, {
			children: ($$renderer) => {
				if (Code.Root) {
					$$renderer.push('<!--[-->');

					Code.Root($$renderer, {
						lang: 'svelte',
						code: codeCode,
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