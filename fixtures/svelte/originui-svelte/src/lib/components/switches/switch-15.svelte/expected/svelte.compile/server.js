import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

export default function Switch_15($$renderer) {
	const uid = $.props_id($$renderer);
	let checked = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]">`);

		Switch($$renderer, {
			id: uid,
			class: 'order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2',
			'aria-describedby': `${uid}-description`,
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="grid grow gap-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p${$.attr('id', `${uid}-description`)} class="text-muted-foreground text-xs">A short description goes here.</p></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}