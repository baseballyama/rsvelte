import * as $ from 'svelte/internal/server';
import { Quaternion } from 'three';
import { AutoColliders, RigidBody } from '@threlte/rapier';

import {
	BoxGeometry,
	ConeGeometry,
	CylinderGeometry,
	SphereGeometry,
	Vector3
} from 'three';

import { T } from '@threlte/core';

const radius = 0.25;

const cuboid = {
	autoCollider: 'cuboid',
	color: 'hotpink',
	geometry: new BoxGeometry(radius, radius, radius)
};

const shapes = [
	cuboid,
	{
		autoCollider: 'ball',
		color: 'cyan',
		geometry: new SphereGeometry(radius)
	},

	{
		autoCollider: 'convexHull',
		color: 'green',
		geometry: new CylinderGeometry(radius, radius, radius * 2)
	},

	{
		autoCollider: 'convexHull',
		color: 'orange',
		geometry: new ConeGeometry(radius, radius * 3, 10)
	}
];

const getRandomShape = (defaultShape = cuboid) => {
	return shapes[Math.floor(Math.random() * shapes.length)] ?? defaultShape;
};

export default function FallingShapes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const offset = new Vector3(-2.5, 2.5, -2.5);
		const bodies = [];
		const count = 50;

		for (let i = 0; i < count; i += 1) {
			bodies.push({
				position: new Vector3().random().multiplyScalar(5).add(offset),
				quaternion: new Quaternion().random()
			});
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(bodies);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let body = each_array[$$index];
			const shape = getRandomShape();

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: body.position.toArray(),
					quaternion: body.quaternion.toArray(),
					children: ($$renderer) => {
						RigidBody($$renderer, {
							type: 'dynamic',
							children: ($$renderer) => {
								AutoColliders($$renderer, {
									shape: shape.autoCollider,
									children: ($$renderer) => {
										children?.($$renderer, { shape });
										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}