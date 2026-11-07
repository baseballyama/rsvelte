import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Group, Vector3 } from 'three';
import { useRapier } from '../../hooks/useRapier.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'strength',
	'range',
	'gravityType',
	'gravitationalConstant',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Attractor($$anchor, $$props) {
	$.push($$props, true);

	const $debug = () => $.store_get(debug, '$debug', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let strength = $.prop($$props, 'strength', 3, 1),
		range = $.prop($$props, 'range', 3, 50),
		gravityType = $.prop($$props, 'gravityType', 3, 'static'),
		gravitationalConstant = $.prop($$props, 'gravitationalConstant', 3, 6.673e-11),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { world, debug } = useRapier();
	const gravitySource = new Vector3();
	const group = new Group();

	const calcForceByType = {
		static: (s, _m2, _r, _d, _G) => s,
		linear: (s, _m2, r, d, _G) => s * (d / r),
		newtonian: (s, m2, _r, d, G) => G * s * m2 / Math.pow(d, 2)
	};

	const impulseVector = new Vector3();
	const bodyV3 = new Vector3();

	function applyImpulseToBodiesInRange() {
		group.getWorldPosition(gravitySource);

		const calcForce = calcForceByType[gravityType()];
		const rangeSquared = range() * range();
		const isNewtonian = gravityType() === 'newtonian';

		world.forEachRigidBody((body) => {
			const { x, y, z } = body.translation();

			bodyV3.set(x, y, z);

			const distance = gravitySource.distanceToSquared(bodyV3);

			if (distance < rangeSquared) {
				let force = calcForce(strength(), isNewtonian ? body.mass() : 0, range(), distance, gravitationalConstant());

				// Prevent wild forces when Attractors collide
				force = force === Infinity ? strength() : force;

				impulseVector.subVectors(gravitySource, bodyV3).normalize().multiplyScalar(force);
				body.applyImpulse(impulseVector, true);
			}
		});
	}

	useTask(() => {
		applyImpulseToBodiesInRange();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
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
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: group }));

				var node_1 = $.sibling(node, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => [range()]);

										$.component(node_3, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
											T_SphereGeometry($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
										T_MeshBasicMaterial($$anchor, { wireframe: true, transparent: true, opacity: 0.25 });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($debug()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
	$$cleanup();
}