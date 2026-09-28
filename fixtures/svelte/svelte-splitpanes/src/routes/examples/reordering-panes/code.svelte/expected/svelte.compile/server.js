import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import Button from '$comp/Button.svelte';

export default function Code($$renderer) {
	const ordered = [{ color: 'red' }, { color: 'blue' }];

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Switch`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Splitpanes($$renderer, {
		style: 'height: 400px',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(ordered);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let val = each_array[$$index];

				Pane($$renderer, {
					minSize: 10,
					children: ($$renderer) => {
						$$renderer.push(`<span${$.attr_style('', { color: val.color })}>${$.escape(val.color)}</span>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}