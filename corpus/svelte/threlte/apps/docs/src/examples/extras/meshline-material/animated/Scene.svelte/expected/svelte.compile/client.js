import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';

import {
	MeshLineMaterial,
	MeshLineGeometry,
	Grid,
	OrbitControls,
	useTexture
} from '@threlte/extras';

import { Vector3, CatmullRomCurve3, Color } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let width = $.prop($$props, 'width', 7, 0.5),
		opacity = $.prop($$props, 'opacity', 3, 1),
		dashArray = $.prop($$props, 'dashArray', 3, 0.5),
		dashRatio = $.prop($$props, 'dashRatio', 3, 0.5),
		attenuate = $.prop($$props, 'attenuate', 3, true),
		scaleDown = $.prop($$props, 'scaleDown', 3, 0);

	// create a smooth curve from 4 points
	const curve = new CatmullRomCurve3([
		new Vector3(-3, 0, 0),
		new Vector3(-1, 1, -1),
		new Vector3(1, -1, 1),
		new Vector3(3, 0, 0)
	]);

	// convert curve to an array of 100 points
	const points = curve.getPoints(100);

	let dashOffset = $.state(0);
	let color = $.state('#fe3d00');
	const orange = new Color('#fe3d00');
	const purple = new Color('#9800fe');
	const c = new Color();

	c.lerpColors(orange, purple, 0.5);

	useTask((delta) => {
		// every frame we:
		// increase the dash offset
		$.set(dashOffset, $.get(dashOffset) + delta / 2);

		// transition between two colors
		$.set(color, `#${c.lerpColors(orange, purple, Math.sin($.get(dashOffset) * 2) / 2 + 0.5).getHexString()}`);

		// shrink and grow the line width
		width(Math.sin($.get(dashOffset) * 2) / 5 + 0.3);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 3,
			scale: 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				MeshLineGeometry(node_1, {
					get points() {
						return points;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				MeshLineMaterial(node_2, {
					get width() {
						return width();
					},

					get color() {
						return $.get(color);
					},

					get opacity() {
						return opacity();
					},

					get dashArray() {
						return dashArray();
					},

					get dashRatio() {
						return dashRatio();
					},

					get dashOffset() {
						return $.get(dashOffset);
					},

					get attenuate() {
						return attenuate();
					},

					get scaleDown() {
						return scaleDown();
					},
					transparent: true,
					depthTest: false
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			oncreate: (ref) => {
				ref.position.set(10, 3, 10);
			},

			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					autoRotate: true,
					autoRotateSpeed: 2,
					enableDamping: true,
					enableZoom: false,
					'target.y': 2
				});
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_3, 2);

	Grid(node_4, {
		gridSize: [10, 10],
		cellColor: '#46536b',
		sectionThickness: 0
	});

	$.append($$anchor, fragment);
	$.pop();
}