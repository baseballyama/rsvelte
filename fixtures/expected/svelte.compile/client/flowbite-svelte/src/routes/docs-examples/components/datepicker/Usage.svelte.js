import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P, Label, Select, Button } from "flowbite-svelte";

var root = $.from_html(`Choose locale: <!>`, 1);
var root_1 = $.from_html(`<strong>Selected Locale:</strong> <br/> <strong>Selected Date:</strong> `, 1);
var root_2 = $.from_html(`<div class="overflow-visible p-4"><h1 class="mb-4 text-xl font-bold">Datepicker Locale Test</h1> <form class="mb-4"><!> <!> <!> <!></form></div>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(undefined);
	let locale = $.state("de");

	const locales = [
		{ value: "en-US", name: "en-US (US)" },
		{ value: "en-GB", name: "en-GB (UK)" },
		{ value: "de", name: "de (Germany)" },
		{ value: "fr", name: "fr (France)" },
		{ value: "ja", name: "ja (Japan)" }
	];

	const handleSubmit = (event) => {
		event.preventDefault();

		console.log("Selected date:", $.get(value)
			? $.get(value).toLocaleDateString($.get(locale))
			: "None");
	};

	$.user_effect(() => {
		// Only clear if locale is actually changing from a previous value
		if ($.get(locale)) {
			$.set(value, undefined);
		}
	});

	var div = root_2();
	var form = $.sibling($.child(div), 2);
	var node = $.child(form);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			Select(node_1, {
				class: 'mb-4 w-40 rounded p-2',
				get items() {
					return locales;
				},

				get value() {
					return $.get(locale);
				},

				set value($$value) {
					$.set(locale, $$value, true);
				}
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Datepicker(node_2, {
		get locale() {
			return $.get(locale);
		},

		get translationLocale() {
			return $.get(locale);
		},
		placeholder: 'Type a date or use calendar',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	P(node_3, {
		class: 'mt-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var text = $.sibling($.first_child(fragment_1));
			var text_1 = $.sibling(text, 4);

			$.template_effect(
				($0) => {
					$.set_text(text, ` ${$.get(locale) ?? ''} `);
					$.set_text(text_1, ` ${$0 ?? ''}`);
				},
				[
					() => $.get(value)
						? $.get(value).toLocaleDateString($.get(locale))
						: "None"
				]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		type: 'submit',
		class: 'mt-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Submit');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.reset(div);
	$.event('submit', form, handleSubmit);
	$.append($$anchor, div);
	$.pop();
}