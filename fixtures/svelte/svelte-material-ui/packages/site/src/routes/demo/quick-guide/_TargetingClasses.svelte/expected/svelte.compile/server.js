import * as $ from 'svelte/internal/server';
import Button, { Label } from '@smui/button';

export default function _TargetingClasses($$renderer) {
	$$renderer.push(`<div class="svelte-847l7">`);

	Button($$renderer, {
		class: 'myClass',
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This button has a Class`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}