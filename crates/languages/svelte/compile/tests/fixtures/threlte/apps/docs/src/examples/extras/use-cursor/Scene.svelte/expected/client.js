import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { interactivity, Text, useCursor } from '@threlte/extras';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $hovering = () => $.store_get(hovering, '$hovering', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { hovering, onPointerEnter, onPointerLeave } = useCursor();

	interactivity();

	const { size } = useThrelte();
	const color = $.derived(() => $hovering() ? '#dddddd' : '#FE3D00');
	const zoom = $.derived(() => $size().width / 7);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			get zoom() {
				return $.get(zoom);
			},
			position: [5, 5, 5],
			oncreate: (ref) => {
				ref.lookAt(0, 0, 0);
			},
			makeDefault: true
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.x': 5 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => 90 * DEG2RAD);

		Text(node_3, {
			text: 'HOVER',
			interactive: true,
			get onpointerenter() {
				return onPointerEnter;
			},

			get onpointerleave() {
				return onPointerLeave;
			},
			fontSize: 0.5,
			anchorY: '100%',
			anchorX: '50%',
			get 'rotation.y'() {
				return $.get($0);
			},
			'position.y': 1,
			'position.x': -1,
			get color() {
				return $.get(color);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get onpointerenter() {
				return onPointerEnter;
			},

			get onpointerleave() {
				return onPointerLeave;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_5 = $.first_child(fragment_1);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get color() {
							return $.get(color);
						}
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [2, 2, 2] });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}