import * as $ from 'svelte/internal/server';
import { SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Time from "carbon-icons-svelte/lib/Time.svelte";

export default function SearchMenuFixture($$renderer) {
	let value = "";
	let lastSelect = "";
	let lastSubmit = "";

	const results = [
		"Databases for TestSQL",
		"AT&T IoT Data Plans",
		"Data Store for Memcache",
		"HazardHub Property Risk Data API"
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button type="button" data-testid="outside-target">Outside target</button> `);

		SearchMenu($$renderer, {
			'data-testid': 'search-input',
			labelText: 'Search',
			placeholder: 'Search...',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SearchMenuGroup($$renderer, {
					label: 'Recent searches',
					filter: false,
					children: ($$renderer) => {
						SearchMenuItem($$renderer, { text: 'recent vpc', icon: Time });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SearchMenuGroup($$renderer, {
					label: 'Results',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(results);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let text = each_array[$$index];

							SearchMenuItem($$renderer, { text });
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SearchMenuGroup($$renderer, {
					divider: true,
					children: ($$renderer) => {
						SearchMenuItem($$renderer, { persistent: true, text: 'Carbon docs', href: '#carbon-docs' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div data-testid="last-select">${$.escape(lastSelect)}</div> <div data-testid="last-submit">${$.escape(lastSubmit)}</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}