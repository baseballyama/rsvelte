import * as $ from 'svelte/internal/server';
import * as Tabs from '$lib/components/ui/tabs';
import { cn } from '$lib/utils';
import { Portal } from 'bits-ui';
import * as Code from '$lib/components/ui/code';
import { useDemoCode } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Demo_code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		let { code, class: className, $$slots, $$events, ...rest } = $$props;
		const codeState = useDemoCode({ code: box.with(() => code) });

		if (Tabs.Content) {
			$$renderer.push('<!--[-->');

			Tabs.Content($$renderer, $.spread_props([
				{
					id: `${uid}-code`,
					value: 'code',
					class: cn('border-border rounded-md border', className)
				},
				rest
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Portal($$renderer, {
			to: `#${uid}-code`,
			children: ($$renderer) => {
				$.await($$renderer, codeState.code, () => {}, (code) => {
					if (Code.Root) {
						$$renderer.push('<!--[-->');

						Code.Root($$renderer, {
							lang: 'svelte',
							code,
							class: 'aspect-video border-none [&_pre]:aspect-video',
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
				});

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}