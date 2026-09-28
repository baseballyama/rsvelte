import * as $ from 'svelte/internal/server';
import { Checkbox, Element, Pane, ThemeUtils } from '$lib';

export default function TestCollapseExpand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let expanded = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!---->${$.escape(expanded)} `);

			Pane($$renderer, {
				expanded: false,
				position: 'draggable',
				storePositionLocally: false,
				title: 'Draggable Pane Unbound Literal',
				x: 8,
				y: 300,
				children: ($$renderer) => {
					Element($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<br/>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				expanded: false,
				position: 'fixed',
				title: 'Fixed Pane Unbound Literal',
				x: 8,
				y: 400,
				children: ($$renderer) => {
					Element($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<br/>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <hr/> `);

			Pane($$renderer, {
				expanded: false,
				position: 'inline',
				title: 'Inline Pane Unbound Literal',
				children: ($$renderer) => {
					Element($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<br/>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				expanded,
				position: 'draggable',
				storePositionLocally: false,
				title: 'Draggable Pane Unbound Variable',
				x: 300,
				y: 300,
				children: ($$renderer) => {
					Element($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<br/>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				expanded,
				position: 'fixed',
				title: 'Fixed Pane Unbound Variable',
				x: 300,
				y: 400,
				children: ($$renderer) => {
					Element($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<br/>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <hr/> `);

			Pane($$renderer, {
				expanded,
				position: 'inline',
				theme: ThemeUtils.presets.light,
				title: 'Inline Pane Unbound Variable',
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->  `);

			Pane($$renderer, {
				position: 'draggable',
				storePositionLocally: false,
				theme: ThemeUtils.presets.light,
				title: 'Draggable Pane Bound Variable',
				x: 600,
				y: 300,
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pane($$renderer, {
				position: 'fixed',
				theme: ThemeUtils.presets.light,
				title: 'Fixed Pane Bound Variable',
				x: 600,
				y: 400,
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <hr/> `);

			Pane($$renderer, {
				position: 'inline',
				theme: ThemeUtils.presets.light,
				title: 'Inline Pane Bound Variable',
				get expanded() {
					return expanded;
				},

				set expanded($$value) {
					expanded = $$value;
					$$settled = false;
				},

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
	});
}