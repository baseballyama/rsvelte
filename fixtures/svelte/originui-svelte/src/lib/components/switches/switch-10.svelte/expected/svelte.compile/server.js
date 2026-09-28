import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';
import IconMoon from '@lucide/svelte/icons/moon';
import IconSun from '@lucide/svelte/icons/sun';

export default function Switch_10($$renderer) {
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
			children: ($$renderer) => {
				$$renderer.push(`<span class="sr-only">Toggle switch</span> `);

				if (checked) {
					$$renderer.push('<!--[0-->');
					IconSun($$renderer, { size: 16, 'aria-hidden': 'true' });
				} else {
					$$renderer.push('<!--[-1-->');
					IconMoon($$renderer, { size: 16, 'aria-hidden': 'true' });
				}

				$$renderer.push(`<!--]-->`);
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