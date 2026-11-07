import * as $ from 'svelte/internal/server';
import MinusIcon from '@lucide/svelte/icons/minus';
import PlusIcon from '@lucide/svelte/icons/plus';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

export default function Indicator($$renderer) {
	Collapsible($$renderer, {
		children: ($$renderer) => {
			if (Collapsible.Content) {
				$$renderer.push('<!--[-->');

				Collapsible.Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->The world dies over and over again, but the skeleton always gets up and walks. Every heart has its own skeletons. The bones of the
		skeleton which support the body can become the bars of the cage which imprison the spirit.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Collapsible.Trigger) {
				$$renderer.push('<!--[-->');

				Collapsible.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<span>Toggle</span> `);

						if (Collapsible.Indicator) {
							$$renderer.push('<!--[-->');

							Collapsible.Indicator($$renderer, {
								class: 'group',
								children: ($$renderer) => {
									MinusIcon($$renderer, { class: 'size-4 group-data-[state=open]:block hidden' });
									$$renderer.push(`<!----> `);
									PlusIcon($$renderer, { class: 'size-4 group-data-[state=open]:hidden block' });
									$$renderer.push(`<!---->`);
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
		},
		$$slots: { default: true }
	});
}