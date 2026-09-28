import * as $ from 'svelte/internal/server';
import { Checkbox, Folder, Pane } from '$lib';

export default function TestInvisibleFolder($$renderer) {
	let expanded = true;
	let darkMode = true;
	let numbers = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pane($$renderer, {
			title: '',
			userExpandable: false,
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Expanded',
					get value() {
						return expanded;
					},

					set value($$value) {
						expanded = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Folder($$renderer, {
					expanded,
					children: ($$renderer) => {
						Checkbox($$renderer, {
							label: 'Dark Mode',
							get value() {
								return darkMode;
							},

							set value($$value) {
								darkMode = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Checkbox($$renderer, {
							label: 'Numbers',
							get value() {
								return numbers;
							},

							set value($$value) {
								numbers = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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