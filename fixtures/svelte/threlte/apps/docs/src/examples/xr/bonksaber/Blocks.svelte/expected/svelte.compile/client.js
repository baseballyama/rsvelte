import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Vector3 } from 'three';
import { T, useTask } from '@threlte/core';
import { InstancedMesh, Instance, RoundedBoxGeometry, Outlines } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Blocks($$anchor, $$props) {
	$.push($$props, true);

	const colors = [
		'#ff5252',
		'#ff4081',
		'#d500f9',
		'#3d5afe',
		'#40c4ff',
		'#18ffff',
		'#f9a825',
		'#ffd740',
		'#bf360c'
	];

	const positions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 0],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1]
	];

	let cubes = [];
	const numCubes = 100;
	const margin = 0.4;
	const spacing = 8;

	for (let i = 0; i < numCubes; i += 1) {
		const [x, y] = positions[Math.trunc(Math.random() * positions.length)];

		cubes.push({
			position: new Vector3(x - margin, y - margin, -i * spacing),
			color: colors[i % colors.length]
		});
	}

	const boxRadius = 0.15;
	const boxSize = 0.6;
	const offsetY = 1.8;
	const offsetZ = 50;
	const speed = 9;
	const passedZ = 3;
	const bodies = $.proxy([]);

	$.user_effect(() => {
		if (!$$props.playing) return;

		for (let i = 0; i < numCubes; i += 1) {
			const body = bodies[i];

			if (!body) continue;

			const spawn = cubes[i].position;

			body.setTranslation({ x: spawn.x, y: spawn.y + offsetY, z: spawn.z - offsetZ }, true);
			body.setLinvel({ x: 0, y: 0, z: speed }, true);
		}
	});

	useTask(() => {
		if (!$$props.playing) return;

		let passed = 0;

		for (const body of bodies) {
			if (body && body.translation().z > passedZ) passed += 1;
		}

		if (passed === numCubes) {
			for (const body of bodies) body?.setLinvel({ x: 0, y: 0, z: 0 }, true);

			$$props.oncomplete();
		}
	});

	InstancedMesh($$anchor, {
		limit: numCubes,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			RoundedBoxGeometry(node, { radius: boxRadius, args: [boxSize, boxSize, boxSize] });

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
				T_MeshStandardMaterial($$anchor, { roughness: 0, metalness: 0.2 });
			});

			var node_2 = $.sibling(node_1, 2);

			Outlines(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 17, () => cubes, $.index, ($$anchor, $$item, index) => {
				let position = () => $.get($$item).position;
				let color = () => $.get($$item).color;
				var fragment_2 = $.comment();
				var node_4 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => position().y + offsetY);
					let $1 = $.derived(() => position().z - offsetZ);

					$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
						T_Group($$anchor, {
							get 'position.x'() {
								return position().x;
							},

							get 'position.y'() {
								return $.get($0);
							},

							get 'position.z'() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								RigidBody($$anchor, {
									get rigidBody() {
										return bodies[index];
									},

									set rigidBody($$value) {
										bodies[index] = $$value;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_5 = $.first_child(fragment_4);

										Collider(node_5, {
											shape: 'cuboid',
											mass: 0.5,
											args: [boxSize / 2, boxSize / 2, boxSize / 2]
										});

										var node_6 = $.sibling(node_5, 2);

										Instance(node_6, {
											get color() {
												return color();
											}
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}