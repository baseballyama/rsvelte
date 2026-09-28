import * as $ from 'svelte/internal/server';
import { MenuField } from 'svelte-ux';
import { curveLinear } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function DagreControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			settings = {
				ranker: 'network-simplex',
				direction: 'left-right',
				align: 'up-left',
				rankSeparation: 50,
				nodeSeparation: 50,
				edgeSeparation: 10,
				edgeLabelPosition: 'center',
				edgeLabelOffset: 10,
				curve: curveLinear,
				arrow: 'arrow'
			},
			class: className
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cls('grid gap-2 screenshot-hidden', className)))}>`);

			MenuField($$renderer, {
				label: 'Ranker',
				options: [
					{ label: 'Network-Simplex', value: 'network-simplex' },
					{ label: 'Tight tree', value: 'tight-tree' },
					{ label: 'Longest path', value: 'longest-path' }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.ranker;
				},

				set value($$value) {
					settings.ranker = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Direction',
				options: [
					{ label: 'Top → Bottom', value: 'top-bottom' },
					{ label: 'Bottom → Top', value: 'bottom-top' },
					{ label: 'Left → Right', value: 'left-right' },
					{ label: 'Right → Left', value: 'right-left' }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.direction;
				},

				set value($$value) {
					settings.direction = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Align',
				options: [
					{ label: 'None', value: 'none' },
					{ label: 'Up / Left', value: 'up-left' },
					{ label: 'Up / Right', value: 'up-right' },
					{ label: 'Down / Left', value: 'down-left' },
					{ label: 'Down / Right', value: 'down-right' }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.align;
				},

				set value($$value) {
					settings.align = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Rank separation',
				options: [
					{ label: 'Compact', value: 10 },
					{ label: 'Default', value: 50 },
					{ label: 'Comfortable', value: 100 }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.rankSeparation;
				},

				set value($$value) {
					settings.rankSeparation = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Node separation',
				options: [
					{ label: 'Compact', value: 10 },
					{ label: 'Default', value: 50 },
					{ label: 'Comfortable', value: 100 }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.nodeSeparation;
				},

				set value($$value) {
					settings.nodeSeparation = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Edge separation',
				options: [
					{ label: 'Compact', value: 5 },
					{ label: 'Default', value: 10 },
					{ label: 'Comfortable', value: 20 }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.edgeSeparation;
				},

				set value($$value) {
					settings.edgeSeparation = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Edge label position',
				options: [
					{ label: 'Left', value: 'left' },
					{ label: 'Center', value: 'center' },
					{ label: 'Right', value: 'right' }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.edgeLabelPosition;
				},

				set value($$value) {
					settings.edgeLabelPosition = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Edge label offset',
				options: [
					{ label: 'Compact', value: 5 },
					{ label: 'Default', value: 10 },
					{ label: 'Comfortable', value: 20 }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.edgeLabelOffset;
				},

				set value($$value) {
					settings.edgeLabelOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CurveMenuField($$renderer, {
				label: 'Curve style',
				dense: true,
				get value() {
					return settings.curve;
				},

				set value($$value) {
					settings.curve = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			MenuField($$renderer, {
				label: 'Arrow / Marker',
				options: [
					{ label: 'arrow', value: 'arrow' },
					{ label: 'triangle', value: 'triangle' },
					{ label: 'circle', value: 'circle' },
					{ label: 'circle-stroke', value: 'circle-stroke' },
					{ label: 'dot', value: 'dot' },
					{ label: 'line', value: 'line' }
				],
				menuIcon: '',
				stepper: true,
				dense: true,
				get value() {
					return settings.arrow;
				},

				set value($$value) {
					settings.arrow = $$value;
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
		$.bind_props($$props, { settings });
	});
}