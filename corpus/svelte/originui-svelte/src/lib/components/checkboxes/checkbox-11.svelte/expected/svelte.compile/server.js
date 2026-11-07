import * as $ from 'svelte/internal/server';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

export default function Checkbox_11($$renderer) {
	const uid = $.props_id($$renderer);
	let checked = false;
	let inputElement = null;

	const handleTransitionEnd = () => {
		if (checked && inputElement) {
			inputElement.focus();
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div><div class="flex items-start gap-2">`);

		Checkbox($$renderer, {
			id: uid,
			'aria-controls': `${uid}-input`,
			class: 'h-4 w-4',
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="grow"><div class="grid gap-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Checkbox with expansion`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p${$.attr('id', `${uid}-description`)} class="text-muted-foreground text-xs">You can use this checkbox with a label and a description.</p></div> <div role="region"${$.attr('id', `${uid}-input`)}${$.attr('aria-labelledby', uid)} class="grid transition-all ease-in-out data-[state=collapsed]:grid-rows-[0fr] data-[state=collapsed]:opacity-0 data-[state=expanded]:grid-rows-[1fr] data-[state=expanded]:opacity-100"${$.attr('data-state', checked ? 'expanded' : 'collapsed')}><div class="-m-2 overflow-hidden p-2"><div class="mt-3">`);

		Input($$renderer, {
			type: 'text',
			id: `${uid}-additional-info`,
			placeholder: 'Enter details',
			'aria-label': 'Additional Information',
			disabled: !checked,
			get ref() {
				return inputElement;
			},

			set ref($$value) {
				inputElement = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div></div></div></div></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}