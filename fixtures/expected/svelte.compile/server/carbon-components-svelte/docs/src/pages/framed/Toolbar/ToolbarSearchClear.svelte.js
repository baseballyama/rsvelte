import * as $ from 'svelte/internal/server';
import { Button, Stack, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

export default function ToolbarSearchClear($$renderer) {
	let toolbarSearch;
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Toolbar($$renderer, {
					children: ($$renderer) => {
						ToolbarContent($$renderer, {
							children: ($$renderer) => {
								ToolbarSearch($$renderer, {
									persistent: true,
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

								Button($$renderer, {
									kind: 'ghost',
									size: 'small',
									disabled: value.length === 0,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear search`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div><strong>Search value:</strong> ${$.escape(value)}</div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}