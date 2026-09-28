import * as $ from 'svelte/internal/server';
import { RangeField, MenuField } from 'svelte-ux';

export default function SankeyControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { config = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-flow-col gap-1 mb-4 screenshot-hidden">`);

			MenuField($$renderer, {
				label: 'Align',
				options: [
					{ label: 'justify', value: 'justify' },
					{ label: 'left', value: 'left' },
					{ label: 'center', value: 'center' },
					{ label: 'right', value: 'right' }
				],

				get value() {
					return config.nodeAlign;
				},

				set value($$value) {
					config.nodeAlign = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Node color',
				options: [
					{ label: 'layer', value: 'layer' },
					{ label: 'depth', value: 'depth' },
					{ label: 'height', value: 'height' },
					{ label: 'index', value: 'index' }
				],

				get value() {
					return config.nodeColorBy;
				},

				set value($$value) {
					config.nodeColorBy = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Link color',
				options: [
					{ label: 'static', value: 'static' },
					{ label: 'source', value: 'source' },
					{ label: 'target', value: 'target' }
				],

				get value() {
					return config.linkColorBy;
				},

				set value($$value) {
					config.linkColorBy = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Node Padding',
				max: 20,
				class: 'col-span-2',
				get value() {
					return config.nodePadding;
				},

				set value($$value) {
					config.nodePadding = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Node Width',
				max: 20,
				get value() {
					return config.nodeWidth;
				},

				set value($$value) {
					config.nodeWidth = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { config });
	});
}