import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Sparkles } from '@threlte/extras';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'count',
	'color',
	'emissive'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sphere($$anchor, $$props) {
	let size = $.prop($$props, 'size', 3, 1),
		count = $.prop($$props, 'count', 3, 100),
		color = $.prop($$props, 'color', 3, 'white'),
		emissive = $.prop($$props, 'emissive', 3, 'white'),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => [size(), 64, 64]);

					$.component(node_1, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
						T_SphereGeometry($$anchor, {
							get args() {
								return $.get($0);
							}
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => emissive() || color());

					$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, {
							roughness: 0,
							metalness: 0.1,
							get color() {
								return color();
							},

							get emissive() {
								return $.get($0);
							},
							envMapIntensity: 0.2
						});
					});
				}

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => size() * 2);

					Sparkles(node_3, {
						get count() {
							return count();
						},

						get scale() {
							return $.get($0);
						},
						size: 6,
						speed: 0.4,
						color: 'white'
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}