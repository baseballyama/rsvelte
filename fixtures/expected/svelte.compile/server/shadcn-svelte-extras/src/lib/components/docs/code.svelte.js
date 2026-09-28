import * as $ from 'svelte/internal/server';
import * as Code from '$lib/components/ui/code';

export default function Code_1($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	if (Code.Root) {
		$$renderer.push('<!--[-->');

		Code.Root($$renderer, $.spread_props([
			rest,
			{
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}