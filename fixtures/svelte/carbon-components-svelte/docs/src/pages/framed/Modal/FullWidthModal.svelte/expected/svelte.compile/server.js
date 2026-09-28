import * as $ from 'svelte/internal/server';
import { Button, DataTable, Modal } from "carbon-components-svelte";

export default function FullWidthModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open full-width modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			fullWidth: true,
			modalLabel: 'An example of a modal with no padding',
			modalHeading: 'Full Width Modal',
			primaryButtonText: 'Add',
			secondaryButtonText: 'Cancel',
			hasScrollingContent: true,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DataTable($$renderer, {
					headers: [
						{ key: "a", value: "Column A" },
						{ key: "b", value: "Column B" },
						{ key: "c", value: "Column C" }
					],
					rows: [
						{
							id: "1",
							a: "Row 1",
							b: "Row 1",
							c: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
						},

						{
							id: "2",
							a: "Row 2",
							b: "Row 2",
							c: "Nunc dui magna, finibus id tortor sed, aliquet bibendum augue."
						}
					]
				});
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
}