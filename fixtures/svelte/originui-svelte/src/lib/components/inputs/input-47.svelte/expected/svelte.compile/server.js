import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Phone from '@lucide/svelte/icons/phone';
import { normalizedCountries, TelInput } from 'svelte-tel-input';
import 'svelte-tel-input/styles/flags.css';

export default function Input_47($$renderer) {
	const uid = $.props_id($$renderer);
	let selectedCountry = null;
	let value = null;

	const handleCountryChange = (e) => {
		const { value } = e.currentTarget;

		selectedCountry = value || null;
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="*:not-first:mt-2" dir="ltr">`);

		Label($$renderer, {
			for: uid,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Phone number input`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="flex rounded-lg shadow-xs shadow-black/[.04]"><div class="border-input bg-background text-muted-foreground ring-offset-background focus-within:border-ring focus-within:text-foreground focus-within:ring-ring/30 hover:bg-accent hover:text-foreground relative inline-flex items-center self-stretch rounded-l-lg border py-2 ps-3 pe-2 transition-shadow focus-within:z-10 focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden has-disabled:pointer-events-none has-disabled:opacity-50"><div class="inline-flex items-center gap-1" aria-hidden="true"><span class="flex h-[16px] w-5 items-center overflow-hidden rounded-sm">`);

		if (selectedCountry) {
			$$renderer.push(`<!--[0--><span${$.attr_class(`flag flag-${$.stringify(selectedCountry.toLowerCase())} h-[13px]! w-5!`)} aria-hidden="true"></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
			Phone($$renderer, { size: 16, 'aria-hidden': 'true' });
		}

		$$renderer.push(`<!--]--></span> <span class="text-muted-foreground/80">`);
		ChevronDown($$renderer, { size: 16, 'aria-hidden': 'true' });
		$$renderer.push(`<!----></span></div> <select class="absolute inset-0 text-sm opacity-0" aria-label="Select country">`);

		$$renderer.option({ value: '' }, ($$renderer) => {
			$$renderer.push(`Select a country`);
		});

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(normalizedCountries);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let country = each_array[$$index];

			$$renderer.option({ value: country.id }, ($$renderer) => {
				$$renderer.push(`${$.escape(country.label)}`);
			});
		}

		$$renderer.push(`<!--]--></select></div> `);

		TelInput($$renderer, {
			id: uid,
			required: true,
			placeholder: 'Enter phone number',
			class: 'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/30 -ml-px flex h-9 w-full rounded-lg rounded-l-none border px-3 py-2 text-sm shadow-none shadow-black/[.04] transition-shadow focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
			options: { format: 'international' },
			get country() {
				return selectedCountry;
			},

			set country($$value) {
				selectedCountry = $$value;
				$$settled = false;
			},

			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://github.com/gyurielf/svelte-tel-input/tree/main" target="_blank" rel="noopener nofollow">svelte-tel-input</a></p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}