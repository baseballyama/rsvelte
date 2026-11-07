import * as $ from 'svelte/internal/server';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

export default function Alignment($$renderer) {
	Collapsible($$renderer, {
		class: 'items-start',
		children: ($$renderer) => {
			if (Collapsible.Trigger) {
				$$renderer.push('<!--[-->');

				Collapsible.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

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
		},
		$$slots: { default: true }
	});
}