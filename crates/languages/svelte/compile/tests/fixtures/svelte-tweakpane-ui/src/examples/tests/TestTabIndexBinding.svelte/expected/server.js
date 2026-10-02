import * as $ from 'svelte/internal/server';
import { Button, Pane, TabGroup, TabPage } from '$lib';

export default function TestTabIndexBinding($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let mode = 0;

	let tabIndex = 1;

	function cycleMode() {
		mode = (mode + 1) % 3;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>Mode: ${$.escape(mode)}</p> <p>TabIndex: ${$.escape(tabIndex)}</p> `);

		if (mode === 0) {
			$$renderer.push('<!--[0-->');

			Pane($$renderer, {
				position: 'draggable',
				storePositionLocally: false,
				title: 'Controls',
				children: ($$renderer) => {
					TabGroup($$renderer, {
						get selectedIndex() {
							return tabIndex;
						},

						set selectedIndex($$value) {
							tabIndex = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							TabPage($$renderer, {
								title: 'A',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabPage($$renderer, {
								title: 'B',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
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
		} else if (mode === 1) {
			$$renderer.push('<!--[1-->');

			Pane($$renderer, {
				position: 'inline',
				title: 'Controls',
				children: ($$renderer) => {
					TabGroup($$renderer, {
						get selectedIndex() {
							return tabIndex;
						},

						set selectedIndex($$value) {
							tabIndex = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							TabPage($$renderer, {
								title: 'A',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							TabPage($$renderer, {
								title: 'B',
								children: ($$renderer) => {
									Button($$renderer, { title: 'Cycle Mode' });
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
		} else {
			$$renderer.push(`<!--[-1--><p>No pane</p>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}