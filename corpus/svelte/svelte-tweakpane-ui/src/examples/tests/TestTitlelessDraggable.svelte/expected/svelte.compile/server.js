import * as $ from 'svelte/internal/server';
import { Pane, Text } from '$lib';

export default function TestTitlelessDraggable($$renderer) {
	let title = '';
	let title2 = 'Title';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<a href="https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/1">Issue #1</a> `);

		Pane($$renderer, {
			position: 'draggable',
			title,
			x: 10,
			y: 150,
			children: ($$renderer) => {
				Text($$renderer, {
					label: 'Pane Title',
					get value() {
						return title;
					},

					set value($$value) {
						title = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Pane($$renderer, {
			localStoreId: 'B',
			position: 'draggable',
			title: title2,
			x: 10,
			y: 220,
			children: ($$renderer) => {
				Text($$renderer, {
					label: 'Pane Title',
					get value() {
						return title2;
					},

					set value($$value) {
						title2 = $$value;
						$$settled = false;
					}
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