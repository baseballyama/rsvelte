import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DoubleSide, MeshBasicMaterial } from 'three';
import RadialGradientTexture from '../GradientTexture/radial/RadialGradientTexture.svelte';
import { T } from '@threlte/core';

const width = 128;
const height = width;
const outerRadius = 0.5 * width;
const end = { color: 'rgba(0,0,0,0)', offset: 1 };

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'ref',
	'transparent',
	'opacity',
	'depthWrite',
	'side',
	'fog'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function ShadowMaterial($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, 'black'),
		ref = $.prop($$props, 'ref', 15),
		transparent = $.prop($$props, 'transparent', 3, true),
		opacity = $.prop($$props, 'opacity', 3, 0.5),
		depthWrite = $.prop($$props, 'depthWrite', 3, false),
		side = $.prop($$props, 'side', 3, DoubleSide),
		fog = $.prop($$props, 'fog', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const start = $.derived(() => ({ color: color(), offset: 0 }));
	const stops = $.derived(() => [$.get(start), end]);
	const material = new MeshBasicMaterial();

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
			},

			get transparent() {
				return transparent();
			},

			get side() {
				return side();
			},

			get depthWrite() {
				return depthWrite();
			},

			get fog() {
				return fog();
			},

			get opacity() {
				return opacity();
			}
		},
		() => restProps,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				RadialGradientTexture(node, {
					width,
					height,
					outerRadius,
					get stops() {
						return $.get(stops);
					}
				});

				var node_1 = $.sibling(node, 2);

				$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: material }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}