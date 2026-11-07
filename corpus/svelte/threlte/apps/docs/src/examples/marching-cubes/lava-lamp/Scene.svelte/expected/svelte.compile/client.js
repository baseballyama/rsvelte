import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MarchingCubes from './MarchingCubes.svelte';
import MarchingPlane from './MarchingPlane.svelte';
import { Color } from 'three';
import { Environment, OrbitControls } from '@threlte/extras';
import { MarchingCube } from './MarchingCube';
import { T, useTask } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let ballCount = $.prop($$props, 'ballCount', 3, 5),
		isolation = $.prop($$props, 'isolation', 3, 80),
		planeAxis = $.prop($$props, 'planeAxis', 3, 'y'),
		resolution = $.prop($$props, 'resolution', 3, 50);

	const randomColor = () => {
		return new Color().setRGB(Math.random(), Math.random(), Math.random());
	};

	/**
	 * creates `count` randomly colored balls that are evenly distributed around a unit circle scaled by `scale`
	 */
	const createBalls = (count, scale = 0.5) => {
		const balls = [];
		const m = 2 * Math.PI / count;

		for (let i = 0; i < count; i += 1) {
			const ball = new MarchingCube(randomColor());
			const r = m * i;
			const x = Math.cos(r);
			const y = Math.sin(r);

			ball.position.set(x, 0, y).multiplyScalar(scale);
			balls.push(ball);
		}

		return balls;
	};

	const balls = $.derived(() => createBalls(ballCount()));
	let time = 0;

	useTask((delta) => {
		time += delta;

		let i = 0;

		for (const ball of $.get(balls)) {
			ball.position.setY(0.5 * Math.sin(time + i) - 0.5);
			i += 1;
		}
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Environment(node_1, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_2 = $.sibling(node_1, 2);

	MarchingCubes(node_2, {
		enableColors: true,
		get resolution() {
			return resolution();
		},

		get isolation() {
			return isolation();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_3 = $.first_child(fragment_2);

			$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
				T_MeshStandardMaterial($$anchor, { vertexColors: true });
			});

			var node_4 = $.sibling(node_3, 2);

			$.each(node_4, 17, () => $.get(balls), $.index, ($$anchor, ball) => {
				T($$anchor, {
					get is() {
						return $.get(ball);
					}
				});
			});

			var node_5 = $.sibling(node_4, 2);

			MarchingPlane(node_5, {
				get axis() {
					return planeAxis();
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}