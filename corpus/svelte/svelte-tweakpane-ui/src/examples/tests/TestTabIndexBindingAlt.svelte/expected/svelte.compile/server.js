import * as $ from 'svelte/internal/server';
import { Button, Pane, TabGroup, TabPage } from '$lib';

export default function TestTabIndexBindingAlt($$renderer) {
	// https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/31
	let draggable = true;

	let tabIndex;

	function toggleDraggable() {
		draggable = !draggable;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p>Draggable: ${$.escape(draggable)}</p> <p>TabIndex: ${$.escape(tabIndex)}</p> `);

		Pane($$renderer, {
			position: draggable ? 'draggable' : 'fixed',
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
								Button($$renderer, { title: 'Toggle Draggable' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TabPage($$renderer, {
							title: 'B',
							children: ($$renderer) => {
								Button($$renderer, { title: 'Toggle Draggable' });
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

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}