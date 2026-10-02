import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownGroup, Checkbox, Search } from "flowbite-svelte";
import { ChevronDownOutline, UserRemoveSolid } from "flowbite-svelte-icons";

export default function Search_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchTerm = "";

		const people = [
			{ name: "Robert Gouth", checked: false },
			{ name: "Jese Leos", checked: false },
			{ name: "Bonnie Green", checked: true }
		];

		let filteredItems = $.derived(() => people.filter((person) => person.name.toLowerCase().indexOf(searchTerm?.toLowerCase()) !== -1));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dropdown search`);
					ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Dropdown($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="p-3">`);

					Search($$renderer, {
						size: 'md',
						get value() {
							return searchTerm;
						},

						set value($$value) {
							searchTerm = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> `);

					DropdownGroup($$renderer, {
						class: 'h-24 overflow-y-auto',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(filteredItems());

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let person = each_array[$$index];

								$$renderer.push(`<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

								Checkbox($$renderer, {
									get checked() {
										return person.checked;
									},

									set checked($$value) {
										person.checked = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(person.name)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></li>`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <a href="/" class="-mb-1 flex items-center bg-gray-50 p-3 text-sm font-medium text-red-600 hover:bg-gray-100 hover:underline dark:bg-gray-700 dark:text-red-500 dark:hover:bg-gray-600">`);
					UserRemoveSolid($$renderer, { class: 'text-primary-700 dark:text-primary-700 me-2 h-4 w-4' });
					$$renderer.push(`<!---->Delete user</a>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}