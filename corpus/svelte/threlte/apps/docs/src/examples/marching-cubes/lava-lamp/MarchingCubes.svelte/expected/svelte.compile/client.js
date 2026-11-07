import 'svelte/internal/disclose-version';
import { Vector3 } from 'three';
import * as $ from 'svelte/internal/client';
import { MarchingCube } from './MarchingCube';
import { MarchingCubes } from 'three/examples/jsm/Addons.js';
import { MarchingPlane } from './MarchingPlane';
import { MeshBasicMaterial } from 'three';
import { T, useTask } from '@threlte/core';

const map = { x: 'addPlaneX', y: 'addPlaneY', z: 'addPlaneZ' };
const position = new Vector3();
const defaultResolution = 50;

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'resolution',
	'children',
	'ref'
]);

export default function MarchingCubes_1($$anchor, $$props) {
	$.push($$props, true);

	let resolution = $.prop($$props, 'resolution', 3, defaultResolution),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const material = new MeshBasicMaterial();
	const marchingCubes = new MarchingCubes(defaultResolution, material, true, true, 20_000);

	$.user_effect(() => {
		if (resolution() !== marchingCubes.resolution) {
			marchingCubes.init(resolution());
		}
	});

	useTask(() => {
		marchingCubes.reset();

		for (const child of marchingCubes.children) {
			switch (true) {
				case child instanceof MarchingCube:
					child.getWorldPosition(position);
					position.addScalar(1).multiplyScalar(0.5);
					// center it
					marchingCubes.addBall(position.x, position.y, position.z, child.strength, child.subtract, child.color);
					break;

				case child instanceof MarchingPlane:
					marchingCubes[map[child.axis]](child.strength, child.subtract);
					break;
			}
		}

		marchingCubes.update();
	});

	// cleanup default material if marchingCubes.material has been set to something else
	$.user_effect(() => {
		return () => {
			if (marchingCubes.material !== material) {
				material.dispose();
			}
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return marchingCubes;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: marchingCubes }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}