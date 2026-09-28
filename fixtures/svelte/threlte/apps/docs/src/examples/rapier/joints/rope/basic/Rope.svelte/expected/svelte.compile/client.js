import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RigidBody as RapierRigidBody } from '@dimforge/rapier3d-compat';
import { observe, T, useTask } from '@threlte/core';
import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
import { Collider, RigidBody, useRopeJoint } from '@threlte/rapier';
import { Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function Rope($$anchor, $$props) {
	$.push($$props, true);

	const lengthBetweenSegments = $$props.length / ($$props.segments - 1);
	let jointsInitialized = $.state(false);

	// make new Array with segments - 1 elements
	const joints = Array.from({ length: $$props.segments - 1 }, () => {
		return useRopeJoint([0, 0, 0], [0, 0, 0], lengthBetweenSegments);
	});

	const rigidBodies = $.proxy([]);
	const objects = $.proxy([]);
	const start = new Vector3().fromArray($$props.ropeStart);
	const end = new Vector3().fromArray($$props.ropeEnd);

	const getIntialRigidBodyPosition = (index) => {
		const t = index / ($$props.segments - 1);

		return start.clone().lerp(end, t);
	};

	$.user_effect(() => {
		if (rigidBodies.length !== $$props.segments || objects.length !== $$props.segments) return;
		if ($.get(jointsInitialized)) return;

		joints.forEach((joint, index) => {
			joint.rigidBodyA.set(rigidBodies[index]);
			joint.rigidBodyB.set(rigidBodies[index + 1]);
		});

		$.set(jointsInitialized, true);
	});

	let points = $.state($.proxy(Array.from({ length: $$props.segments }, () => {
		return new Vector3(0, 0, 0);
	})));

	useTask(() => {
		if (!$.get(jointsInitialized)) return;

		for (let i = 0; i < objects.length; i++) {
			const obj = objects[i];

			obj?.getWorldPosition($.get(points)[i]);
		}

		$.set(points, [...$.get(points)], true);
	});

	observe(() => [$.get(jointsInitialized), $$props.ropeStart, $$props.ropeEnd], ([jointsInitialized]) => {
		if (!jointsInitialized) return;

		const firstRigidBody = rigidBodies.at(0);
		const lastRigidBody = rigidBodies.at(-1);

		firstRigidBody.setNextKinematicTranslation({
			x: $$props.ropeStart[0],
			y: $$props.ropeStart[1],
			z: $$props.ropeStart[2]
		});

		lastRigidBody.setNextKinematicTranslation({
			x: $$props.ropeEnd[0],
			y: $$props.ropeEnd[1],
			z: $$props.ropeEnd[2]
		});
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 17, () => ({ length: $$props.segments }), $.index, ($$anchor, _, i) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				oncreate: (ref) => {
					ref.position.copy(getIntialRigidBodyPosition(i));
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => i === 0 || i === $$props.segments - 1 ? 'kinematicPosition' : 'dynamic');

						RigidBody($$anchor, {
							get linearDamping() {
								return $$props.damping;
							},

							get angularDamping() {
								return $$props.damping;
							},

							get type() {
								return $.get($0);
							},

							get rigidBody() {
								return rigidBodies[i];
							},

							set rigidBody($$value) {
								rigidBodies[i] = $$value;
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => [$$props.ballRadius]);

									Collider($$anchor, {
										shape: 'ball',
										get args() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => T.Object3D, ($$anchor, T_Object3D) => {
												T_Object3D($$anchor, {
													get ref() {
														return objects[i];
													},

													set ref($$value) {
														objects[i] = $$value;
													}
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_1);
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_4 = $.first_child(fragment_5);

				MeshLineGeometry(node_4, {
					get points() {
						return $.get(points);
					},
					shape: 'none'
				});

				var node_5 = $.sibling(node_4, 2);

				MeshLineMaterial(node_5, { width: 0.4, color: '#FE3D00' });
				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}