import * as $ from 'svelte/internal/server';
import { Search } from "carbon-components-svelte";

export default function SearchFixture($$renderer) {
	let value = "";
	let valueExpandable = "";
	let expanded = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Search($$renderer, {
			'data-testid': 'search-query',
			labelText: 'Search',
			placeholder: 'Search...',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Search($$renderer, {
			'data-testid': 'search-expandable',
			labelText: 'Expandable search',
			placeholder: 'Search...',
			expandable: true,
			get expanded() {
				return expanded;
			},

			set expanded($$value) {
				expanded = $$value;
				$$settled = false;
			},

			get value() {
				return valueExpandable;
			},

			set value($$value) {
				valueExpandable = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}