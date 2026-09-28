import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Spring } from 'svelte/motion';
import { Mesh } from 'three';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'color']);
var root = $.from_html(`<!> <!>`, 1);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let hovering = $.proxy({ left: false, right: false });
	let pressed = $.proxy({ left: false, right: false });
	const isHovered = $.derived(() => hovering.left || hovering.right);
	const isPressed = $.derived(() => pressed.left || pressed.right);
	let rest = $.rest_props($$props, rest_excludes);
	const pressDepth = 0.03;
	const press = new Spring(0);
	const mesh = new Mesh();

	$.user_effect(() => {
		mesh.position.z = ($$props.position.z ?? 0) - press.current * pressDepth;
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return mesh;
			},

			onpointerenter: (event) => {
				hovering[event.handedness] = true;
			},

			onpointerleave: (event) => {
				hovering[event.handedness] = false;
			},

			onpointerdown: (event) => {
				pressed[event.handedness] = true;
				press.set(1);
			},

			onpointerup: (event) => {
				pressed[event.handedness] = false;

				if (!$.get(isPressed)) press.set(0);
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.component(node, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [0.08, 0.08, 0.04] });
				});

				var node_1 = $.sibling(node, 2);

				{
					let $0 = $.derived(() => $.get(isHovered) ? 0.4 : 0.1);

					$.component(node_1, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, {
							get color() {
								return $$props.color;
							},

							get emissive() {
								return $$props.color;
							},

							get emissiveIntensity() {
								return $.get($0);
							}
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}