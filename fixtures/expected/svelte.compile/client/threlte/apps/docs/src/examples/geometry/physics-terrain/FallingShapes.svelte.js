import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function FallingShapes($$anchor, $$props) {
	$.push($$props, true);

	const offset = new Vector3(-2.5, 2.5, -2.5);
	const bodies = [];
	const count = 50;

	for (let i = 0; i < count; i += 1) {
		bodies.push({
			position: new Vector3().random().multiplyScalar(5).add(offset),
			quaternion: new Quaternion().random()
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => bodies, $.index, ($$anchor, body) => {
		const shape = $.derived(getRandomShape);
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			let $0 = $.derived(() => $.get(body).position.toArray());
			let $1 = $.derived(() => $.get(body).quaternion.toArray());

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					get position() {
						return $.get($0);
					},

					get quaternion() {
						return $.get($1);
					},

					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							type: 'dynamic',
							children: ($$anchor, $$slotProps) => {
								AutoColliders($$anchor, {
									get shape() {
										return $.get(shape).autoCollider;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_2 = $.first_child(fragment_4);

										$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ shape: $.get(shape) }));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}