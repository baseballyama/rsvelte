import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_08($$renderer) {
	const uid = $.props_id($$renderer);
	let checked = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="inline-flex items-center gap-2">`);

		Switch($$renderer, {
			id: uid,
			'aria-label': 'Toggle switch',
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Label($$renderer, {
			for: uid,
			class: 'text-sm font-medium',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(checked ? 'On' : 'Off')}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}