import * as $ from 'svelte/internal/server';
import { Search } from "carbon-components-svelte";

export default function SearchExpandableReactive($$renderer) {
	let expanded = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Search($$renderer, {
			expandable: true,
			get expanded() {
				return expanded;
			},

			set expanded($$value) {
				expanded = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <br/> <strong>Expanded:</strong> ${$.escape(expanded)}`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}