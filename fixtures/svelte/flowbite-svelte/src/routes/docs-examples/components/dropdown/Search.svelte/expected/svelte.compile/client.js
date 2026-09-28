import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, DropdownGroup, Checkbox, Search } from "flowbite-svelte";
import { ChevronDownOutline, UserRemoveSolid } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown search<!>`, 1);
var root_1 = $.from_html(`<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600"><!></li>`);
var root_2 = $.from_html(`<div class="p-3"><!></div> <!> <a href="/" class="-mb-1 flex items-center bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600"><!>Delete user</a>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Search_1($$anchor, $$props) {
	$.push($$props, true);

	let searchTerm = $.state("");

	const people = [
		{ name: "Robert Gouth", checked: false },
		{ name: "Jese Leos", checked: false },
		{ name: "Bonnie Green", checked: true }
	];

	let filteredItems = $.derived(() => people.filter((person) => person.name.toLowerCase().indexOf($.get(searchTerm)?.toLowerCase()) !== -1));
	var fragment = root_3();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Dropdown(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var div = $.first_child(fragment_2);
			var node_3 = $.child(div);

			Search(node_3, {
				size: 'md',
				get value() {
					return $.get(searchTerm);
				},

				set value($$value) {
					$.set(searchTerm, $$value, true);
				}
			});

			$.reset(div);

			var node_4 = $.sibling(div, 2);

			DropdownGroup(node_4, {
				class: 'h-24 overflow-y-auto',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.each(node_5, 17, () => $.get(filteredItems), (person) => person.name, ($$anchor, person, $$index) => {
						var li = root_1();
						var node_6 = $.child(li);

						Checkbox(node_6, {
							get checked() {
								return $.get(person).checked;
							},

							set checked($$value) {
								($.get(person).checked = $$value);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, $.get(person).name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						$.reset(li);
						$.append($$anchor, li);
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var a = $.sibling(node_4, 2);
			var node_7 = $.child(a);

			UserRemoveSolid(node_7, { class: 'text-primary-700 dark:text-primary-700 me-2 h-4 w-4' });
			$.next();
			$.reset(a);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}