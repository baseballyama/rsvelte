import * as $ from 'svelte/internal/server';
import { Button, CodeSnippet } from "carbon-components-svelte";

export default function CodeSnippetReactive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let expanded = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle expansion`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CodeSnippet($$renderer, {
				type: 'multi',
				code: Array.from({ length: 30 }, (_, i) => i + 1).join("\n"),
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
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
	});
}