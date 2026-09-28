import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Align, Grid, OrbitControls, UvMaterial } from '@threlte/extras';
import { T } from '@threlte/core';

import {
	BoxGeometry,
	CapsuleGeometry,
	CircleGeometry,
	ConeGeometry,
	CylinderGeometry,
	DodecahedronGeometry,
	ExtrudeGeometry,
	IcosahedronGeometry,
	LatheGeometry,
	OctahedronGeometry,
	PerspectiveCamera,
	RingGeometry,
	ShapeGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	TorusGeometry,
	TorusKnotGeometry,
	Vector3
} from 'three';

const cameraAxis = new Vector3(0.75, 0.5, 1).normalize();

const geometries = [
	BoxGeometry,
	CapsuleGeometry,
	CircleGeometry,
	ConeGeometry,
	CylinderGeometry,
	DodecahedronGeometry,
	ExtrudeGeometry,
	IcosahedronGeometry,
	LatheGeometry,
	OctahedronGeometry,
	RingGeometry,
	ShapeGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	TorusGeometry,
	TorusKnotGeometry
].map((constructor) => new constructor());

const width = 4;
const gap = 4;
const cameraTranslationAmount = 5 * width;
const gridColor = '#ffffff';
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const camera = new PerspectiveCamera();

	camera.translateOnAxis(cameraAxis, cameraTranslationAmount);

	var fragment = root_1();
	var node = $.first_child(fragment);

	T(node, {
		get is() {
			return camera;
		},
		makeDefault: true,
		children: ($$anchor, $$slotProps) => {
			OrbitControls($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Align(node_1, {
		'position.y': 2,
		oncreate: (ref) => {
			camera.lookAt(ref.position);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => geometries, $.index, ($$anchor, geometry, i) => {
				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => gap * Math.floor(i / width));

					$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							'position.x': gap * (i % width),
							get 'position.z'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_4 = $.first_child(fragment_4);

								T(node_4, {
									get is() {
										return $.get(geometry);
									}
								});

								var node_5 = $.sibling(node_4, 2);

								UvMaterial(node_5, {});
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_1, 2);

	Grid(node_6, {
		infiniteGrid: true,
		cellColor: gridColor,
		sectionColor: gridColor
	});

	$.append($$anchor, fragment);
	$.pop();
}