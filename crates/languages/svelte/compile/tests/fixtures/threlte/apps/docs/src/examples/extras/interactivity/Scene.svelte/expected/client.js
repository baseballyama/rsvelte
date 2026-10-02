import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Grid, interactivity, OrbitControls, useCursor } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const boxPosition = new Spring([0, 0]);
	const random = () => 10 * Math.random() - 5;
	const scale = new Spring(1);
	const boxSize = 1;
	const positionY = $.derived(() => 0.5 * boxSize * scale.current);
	const { onPointerEnter, onPointerLeave } = useCursor();
	const notHoveringColor = '#ffffff';
	const hoveringColor = '#fe3d00';
	let color = $.state(notHoveringColor);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			zoom: 40,
			position: 10,
			makeDefault: true,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [1, 2, 5] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			onclick: () => {
				boxPosition.target = [random(), random()];
			},

			onpointerenter: () => {
				onPointerEnter();
				scale.target = 2;
				$.set(color, hoveringColor);
			},

			onpointerleave: () => {
				onPointerLeave();
				scale.target = 1;
				$.set(color, notHoveringColor);
			},

			get scale() {
				return scale.current;
			},

			get 'position.x'() {
				return boxPosition.current[0];
			},

			get 'position.y'() {
				return $.get(positionY);
			},

			get 'position.z'() {
				return boxPosition.current[1];
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, { args: [boxSize, boxSize, boxSize] });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get color() {
							return $.get(color);
						}
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	Grid(node_6, {
		'position.y': -1 * 0.5,
		cellColor: '#ffffff',
		sectionColor: '#ffffff',
		sectionThickness: 0,
		fadeDistance: 25,
		cellSize: 2
	});

	$.append($$anchor, fragment);
	$.pop();
}