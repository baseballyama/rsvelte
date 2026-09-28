import * as $ from 'svelte/internal/server';
import { Checkbox, Element, TabGroup, TabPage, Text } from '$lib';

export default function TestElementIfStatement($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/18
	// https://svelte.dev/repl/3cc711caf304411dbf2d6fc8d2493219?version=4.2.19
	let text = '#1234';

	let text2 = '#1235';
	let check = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TabGroup($$renderer, {
			children: ($$renderer) => {
				TabPage($$renderer, {
					title: 'A',
					children: ($$renderer) => {
						Checkbox($$renderer, {
							label: 'Visibility',
							get value() {
								return check;
							},

							set value($$value) {
								check = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (check) {
							$$renderer.push('<!--[0-->');

							Element($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->🅱️`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								label: 'C',
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						Text($$renderer, {
							label: 'D',
							get value() {
								return text2;
							},

							set value($$value) {
								text2 = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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