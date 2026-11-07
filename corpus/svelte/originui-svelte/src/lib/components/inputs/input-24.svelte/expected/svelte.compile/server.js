import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import CircleX from '@lucide/svelte/icons/circle-x';

export default function Input_24($$renderer) {
	const uid = $.props_id($$renderer);
	let inputValue = 'Click to clear';
	let inputElement = null;

	function handleClearInput() {
		inputValue = '';
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="*:not-first:mt-2">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Input with clear button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="relative">`);

		Input($$renderer, {
			id: uid,
			class: 'pe-9',
			placeholder: 'Type something...',
			type: 'text',
			get ref() {
				return inputElement;
			},

			set ref($$value) {
				inputElement = $$value;
				$$settled = false;
			},

			get value() {
				return inputValue;
			},

			set value($$value) {
				inputValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		if (inputValue) {
			$$renderer.push(`<!--[0--><button class="text-muted-foreground/80 ring-offset-background animate-in fade-in zoom-in-75 hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Clear input">`);
			CircleX($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}