import * as $ from 'svelte/internal/server';
import { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
import { observe, T, useTask } from '@threlte/core';
import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
import { Collider, RigidBody, useRopeJoint } from '@threlte/rapier';
import { Vector3 } from 'three';

export default function Rope($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { segments, ropeStart, ropeEnd, length, ballRadius, damping } = $$props;
		const lengthBetweenSegments = length / (segments - 1);
		let jointsInitialized = false;

		// make new Array with segments - 1 elements
		const joints = Array.from({ length: segments - 1 }, () => {
			return useRopeJoint([0, 0, 0], [0, 0, 0], lengthBetweenSegments);
		});

		const rigidBodies = [];
		const objects = [];
		const start = new Vector3().fromArray(ropeStart);
		const end = new Vector3().fromArray(ropeEnd);

		const getIntialRigidBodyPosition = (index) => {
			const t = index / (segments - 1);

			return start.clone().lerp(end, t);
		};

		let points = Array.from({ length: segments }, () => {
			return new Vector3(0, 0, 0);
		});

		useTask(() => {
			if (!jointsInitialized) return;

			for (let i = 0; i < objects.length; i++) {
				const obj = objects[i];

				obj?.getWorldPosition(points[i]);
			}

			points = [...points];
		});

		observe(() => [jointsInitialized, ropeStart, ropeEnd], ([jointsInitialized]) => {
			if (!jointsInitialized) return;

			const firstRigidBody = rigidBodies.at(0);
			const lastRigidBody = rigidBodies.at(-1);

			firstRigidBody.setNextKinematicTranslation({ x: ropeStart[0], y: ropeStart[1], z: ropeStart[2] });
			lastRigidBody.setNextKinematicTranslation({ x: ropeEnd[0], y: ropeEnd[1], z: ropeEnd[2] });
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like({ length: segments });

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let _ = each_array[i];

				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						oncreate: (ref) => {
							ref.position.copy(getIntialRigidBodyPosition(i));
						},

						children: ($$renderer) => {
							RigidBody($$renderer, {
								linearDamping: damping,
								angularDamping: damping,
								type: i === 0 || i === segments - 1 ? 'kinematicPosition' : 'dynamic',
								get rigidBody() {
									return rigidBodies[i];
								},

								set rigidBody($$value) {
									rigidBodies[i] = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									Collider($$renderer, {
										shape: 'ball',
										args: [ballRadius],
										children: ($$renderer) => {
											if (T.Object3D) {
												$$renderer.push('<!--[-->');

												T.Object3D($$renderer, {
													get ref() {
														return objects[i];
													},

													set ref($$value) {
														objects[i] = $$value;
														$$settled = false;
													}
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
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

			$$renderer.push(`<!--]--> `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					children: ($$renderer) => {
						MeshLineGeometry($$renderer, { points, shape: 'none' });
						$$renderer.push(`<!----> `);
						MeshLineMaterial($$renderer, { width: 0.4, color: '#FE3D00' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}