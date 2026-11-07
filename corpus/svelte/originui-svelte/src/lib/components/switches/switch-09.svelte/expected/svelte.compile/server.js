import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_09($$renderer) {
	const uid = $.props_id($$renderer);
	let checked = false;

	function toggleSwitch() {
		checked = !checked;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div>`);

		Label($$renderer, {
			for: uid,
			class: 'sr-only',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle switch`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="group inline-flex items-center gap-2"${$.attr('data-state', checked ? 'checked' : 'unchecked')}><button${$.attr('id', `${uid}-off-label`)} class="group-data-[state=checked]:text-muted-foreground/70 flex-1 cursor-pointer text-right text-sm font-medium">Off</button> `);

		Switch($$renderer, {
			id: uid,
			'aria-labelledby': `$${uid}-off-label $${uid}-on-label`,
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <button${$.attr('id', `${uid}-on-label`)} class="group-data-[state=unchecked]:text-muted-foreground/70 flex-1 cursor-pointer text-left text-sm font-medium">On</button></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}