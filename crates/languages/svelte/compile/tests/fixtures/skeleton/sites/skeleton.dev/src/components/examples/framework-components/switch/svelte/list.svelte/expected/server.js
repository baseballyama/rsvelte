import * as $ from 'svelte/internal/server';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function List($$renderer) {
	$$renderer.push(`<div class="grid gap-2 w-full"><!--[-->`);

	const each_array = $.ensure_array_like(['Label 1', 'Label 2', 'Label 3']);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let label = each_array[i];

		Switch($$renderer, {
			class: 'flex justify-between p-2',
			children: ($$renderer) => {
				if (Switch.Label) {
					$$renderer.push('<!--[-->');

					Switch.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(label)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Switch.Control) {
					$$renderer.push('<!--[-->');

					Switch.Control($$renderer, {
						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');
								Switch.Thumb($$renderer, {});
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

				if (Switch.HiddenInput) {
					$$renderer.push('<!--[-->');
					Switch.HiddenInput($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (i < 2) {
			$$renderer.push(`<!--[0--><hr class="hr"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--></div>`);
}