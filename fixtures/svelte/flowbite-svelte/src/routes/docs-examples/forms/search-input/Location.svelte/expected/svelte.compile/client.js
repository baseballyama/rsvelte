import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<img class="me-2 h-3.5 w-3.5 rounded-full"/> <!>`, 1);
var root_1 = $.from_html(`<img class="me-2 h-3.5 w-3.5 rounded-full"/> `, 1);
var root_2 = $.from_html(`<form class="flex"><div class="relative"><!> <!></div> <!> <!></form>`);

export default function Location($$anchor) {
	const countries = [
		{
			label: "United States",
			labelSelected: "USA",
			icon: "/images/forms/search-input/usa-flag.svg"
		},

		{
			label: "Germany",
			labelSelected: "DE",
			icon: "/images/forms/search-input/de-flag.svg"
		},

		{
			label: "Italy",
			labelSelected: "ITA",
			icon: "/images/forms/search-input/it-flag.svg"
		},

		{
			label: "China",
			labelSelected: "CH",
			icon: "/images/forms/search-input/ch-flag.svg"
		}
	];

	let selectCountry = $.state("USA");
	let buttonLabel = $.derived(() => countries.find(({ labelSelected }) => labelSelected === $.get(selectCountry)));
	var form = root_2();
	var div = $.child(form);
	var node = $.child(div);

	Button(node, {
		class: 'border-primary-700 rounded-e-none border border-e-0 whitespace-nowrap',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var img = $.first_child(fragment);
			var text = $.sibling(img);
			var node_1 = $.sibling(text);

			ChevronDownOutline(node_1, { class: 'ms-2.5 h-6 w-6' });

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(buttonLabel)?.icon);
				$.set_attribute(img, 'alt', $.get(buttonLabel)?.label);
				$.set_text(text, ` ${$.get(buttonLabel)?.labelSelected ?? ''} `);
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Dropdown(node_2, {
		simple: true,
		class: 'w-40',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 17, () => countries, $.index, ($$anchor, country) => {
				{
					let $0 = $.derived(() => $.get(selectCountry) === $.get(country).labelSelected ? 'underline' : '');

					DropdownItem($$anchor, {
						onclick: () => {
							$.set(selectCountry, $.get(country).labelSelected, true);
						},

						get class() {
							return `inline-flex items-center ${$.get($0) ?? ''}`;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var img_1 = $.first_child(fragment_3);
							var text_1 = $.sibling(img_1);

							$.template_effect(() => {
								$.set_attribute(img_1, 'src', $.get(country).icon);
								$.set_attribute(img_1, 'alt', $.get(country).label);
								$.set_text(text_1, ` ${$.get(country).label ?? ''}`);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_4 = $.sibling(div, 2);

	Search(node_4, {
		size: 'lg',
		classes: { input: "rounded-none py-2.5" },
		placeholder: 'Search Mockups, Logos, Design Templates...'
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		class: 'rounded-s-none p-2!',
		children: ($$anchor, $$slotProps) => {
			SearchOutline($$anchor, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}