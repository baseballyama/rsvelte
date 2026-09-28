import * as $ from 'svelte/internal/server';
import { Vector3 } from 'three';
import { T, useTask } from '@threlte/core';
import { InstancedMesh, Instance, RoundedBoxGeometry, Outlines } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';

export default function Blocks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { playing, oncomplete } = $$props;

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
		const bodies = [];

		useTask(() => {
			if (!playing) return;

			let passed = 0;

			for (const body of bodies) {
				if (body && body.translation().z > passedZ) passed += 1;
			}

			if (passed === numCubes) {
				for (const body of bodies) body?.setLinvel({ x: 0, y: 0, z: 0 }, true);

				oncomplete();
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InstancedMesh($$renderer, {
				limit: numCubes,
				children: ($$renderer) => {
					RoundedBoxGeometry($$renderer, { radius: boxRadius, args: [boxSize, boxSize, boxSize] });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { roughness: 0, metalness: 0.2 });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Outlines($$renderer, {});
					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like(cubes);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let { position, color } = each_array[index];

						if (T.Group) {
							$$renderer.push('<!--[-->');

							T.Group($$renderer, {
								'position.x': position.x,
								'position.y': position.y + offsetY,
								'position.z': position.z - offsetZ,
								children: ($$renderer) => {
									RigidBody($$renderer, {
										get rigidBody() {
											return bodies[index];
										},

										set rigidBody($$value) {
											bodies[index] = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											Collider($$renderer, {
												shape: 'cuboid',
												mass: 0.5,
												args: [boxSize / 2, boxSize / 2, boxSize / 2]
											});

											$$renderer.push(`<!----> `);
											Instance($$renderer, { color });
											$$renderer.push(`<!---->`);
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}