import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Phone from '@lucide/svelte/icons/phone';
import { normalizedCountries, TelInput } from 'svelte-tel-input';
import 'svelte-tel-input/styles/flags.css';

var root = $.from_html(`<span aria-hidden="true"></span>`);
var root_1 = $.from_html(`<option> </option>`);
var root_2 = $.from_html(`<div class="*:not-first:mt-2" dir="ltr"><!> <div class="flex rounded-lg shadow-xs shadow-black/[.04]"><div class="border-input bg-background text-muted-foreground ring-offset-background focus-within:border-ring focus-within:text-foreground focus-within:ring-ring/30 hover:bg-accent hover:text-foreground relative inline-flex items-center self-stretch rounded-l-lg border py-2 ps-3 pe-2 transition-shadow focus-within:z-10 focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden has-disabled:pointer-events-none has-disabled:opacity-50"><div class="inline-flex items-center gap-1" aria-hidden="true"><span class="flex h-[16px] w-5 items-center overflow-hidden rounded-sm"><!></span> <span class="text-muted-foreground/80"><!></span></div> <select class="absolute inset-0 text-sm opacity-0" aria-label="Select country"><option>Select a country</option><!></select></div> <!></div> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://github.com/gyurielf/svelte-tel-input/tree/main" target="_blank" rel="noopener nofollow">svelte-tel-input</a></p></div>`);

export default function Input_47($$anchor) {
	const uid = $.props_id();
	let selectedCountry = $.state(null);
	let value = $.state(null);

	const handleCountryChange = (e) => {
		const { value } = e.currentTarget;

		$.set(selectedCountry, value || null, true);
	};

	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Phone number input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var span = $.child(div_3);
	var node_1 = $.child(span);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();

			$.template_effect(($0) => $.set_class(span_1, 1, `flag flag-${$0 ?? ''} h-[13px]! w-5!`), [() => $.get(selectedCountry).toLowerCase()]);
			$.append($$anchor, span_1);
		};

		var alternate = ($$anchor) => {
			Phone($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		$.if(node_1, ($$render) => {
			if ($.get(selectedCountry)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(span);

	var span_2 = $.sibling(span, 2);
	var node_2 = $.child(span_2);

	ChevronDown(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(span_2);
	$.reset(div_3);

	var select = $.sibling(div_3, 2);
	var option = $.child(select);

	option.value = option.__value = '';

	var node_3 = $.sibling(option);

	$.each(node_3, 17, () => normalizedCountries, (country) => country.id, ($$anchor, country) => {
		var option_1 = root_1();
		var text_1 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_1, $.get(country).label);

			if (option_1_value !== (option_1_value = $.get(country).id)) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	TelInput(node_4, {
		get id() {
			return uid;
		},
		required: true,
		placeholder: 'Enter phone number',
		class: 'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/30 -ml-px flex h-9 w-full rounded-lg rounded-l-none border px-3 py-2 text-sm shadow-none shadow-black/[.04] transition-shadow focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
		options: { format: 'international' },
		get country() {
			return $.get(selectedCountry);
		},

		set country($$value) {
			$.set(selectedCountry, $$value, true);
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.template_effect(() => div.dir = div.dir);
	$.delegated('change', select, handleCountryChange);
	$.append($$anchor, div);
}

$.delegate(['change']);