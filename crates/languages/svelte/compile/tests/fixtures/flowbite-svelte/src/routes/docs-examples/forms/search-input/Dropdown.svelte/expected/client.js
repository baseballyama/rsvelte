import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<form class="flex"><div class="relative"><!> <!></div> <!> <!></form>`);

export default function Dropdown_1($$anchor) {
	const items = [
		{ label: "All categories" },
		{ label: "Mockups" },
		{ label: "Templates" },
		{ label: "Design" },
		{ label: "Logos" }
	];

	let selectCategory = $.state("All categories");
	var form = root_1();
	var div = $.child(form);
	var node = $.child(div);

	Button(node, {
		class: 'border-primary-700 rounded-e-none border border-e-0 whitespace-nowrap',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var text = $.first_child(fragment);
			var node_1 = $.sibling(text);

			ChevronDownOutline(node_1, { class: 'ms-2.5 h-6 w-6' });
			$.template_effect(() => $.set_text(text, `${$.get(selectCategory) ?? ''} `));
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

			$.each(node_3, 17, () => items, ({ label }) => label, ($$anchor, $$item) => {
				let label = () => $.get($$item).label;

				{
					let $0 = $.derived(() => $.get(selectCategory) === label() ? "underline" : "");

					DropdownItem($$anchor, {
						onclick: () => {
							$.set(selectCategory, label(), true);
						},

						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, label()));
							$.append($$anchor, text_1);
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