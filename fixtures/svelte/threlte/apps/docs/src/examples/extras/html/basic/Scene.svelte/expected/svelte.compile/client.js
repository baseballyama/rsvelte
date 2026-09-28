import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { HTML, OrbitControls } from '@threlte/extras';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<button class="cursor-pointer rounded-full bg-orange-500 px-3 text-white hover:opacity-90 active:opacity-70">I'm a regular HTML button</button>`);
var root_1 = $.from_html(`<p class="w-auto translate-x-1/2 text-xs drop-shadow-lg"> </p>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let autoRender = $.prop($$props, 'autoRender', 3, true);
	const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
	let color = $.state($.proxy(getRandomColor()));
	let isHovering = $.state(false);
	let isPointerDown = $.state(false);
	const htmlPosZ = Spring.of(() => $.get(isPointerDown) ? -0.15 : $.get(isHovering) ? -0.075 : 0);
	var fragment = root_3();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [10, 5, 10],
			makeDefault: true,
			fov: 30,
			oncreate: (ref) => ref.lookAt(0, 0.75, 0),
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => 85 * MathUtils.DEG2RAD);
					let $1 = $.derived(() => 20 * MathUtils.DEG2RAD);
					let $2 = $.derived(() => 45 * MathUtils.DEG2RAD);
					let $3 = $.derived(() => -45 * MathUtils.DEG2RAD);

					OrbitControls($$anchor, {
						'target.y': 0.75,
						get maxPolarAngle() {
							return $.get($0);
						},

						get minPolarAngle() {
							return $.get($1);
						},

						get maxAzimuthAngle() {
							return $.get($2);
						},

						get minAzimuthAngle() {
							return $.get($3);
						},
						enableZoom: false
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 10, 10] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.3 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, {});
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get color() {
							return $.get(color);
						}
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, { args: [0.5] });
				});

				var node_7 = $.sibling(node_6, 2);

				HTML(node_7, {
					'position.y': 1.25,
					get 'position.z'() {
						return htmlPosZ.current;
					},
					transform: true,
					get autoRender() {
						return autoRender();
					},

					children: ($$anchor, $$slotProps) => {
						var button = root();

						$.event('pointerenter', button, () => $.set(isHovering, true));

						$.event('pointerleave', button, () => {
							$.set(isPointerDown, false);
							$.set(isHovering, false);
						});

						$.delegated('pointerdown', button, () => {
							$.set(isPointerDown, true);
							$.set(color, getRandomColor(), true);
						});

						$.delegated('pointerup', button, () => $.set(isPointerDown, false));

						$.event('pointercancel', button, () => {
							$.set(isPointerDown, false);
							$.set(isHovering, false);
						});

						$.append($$anchor, button);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				HTML(node_8, {
					'position.x': 0.75,
					transform: true,
					pointerEvents: 'none',
					get autoRender() {
						return autoRender();
					},

					children: ($$anchor, $$slotProps) => {
						var p = root_1();
						var text = $.only_child(p);

						$.template_effect(() => {
							$.set_style(p, `color: ${$.get(color) ?? ''}`);
							$.set_text(text, `color: ${$.get(color) ?? ''}`);
						});

						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['pointerdown', 'pointerup']);