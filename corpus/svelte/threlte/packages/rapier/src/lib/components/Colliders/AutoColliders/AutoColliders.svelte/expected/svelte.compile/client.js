import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ActiveCollisionTypes, CoefficientCombineRule } from '@dimforge/rapier3d-compat';
import { createParentObject3DContext, useParentObject3D } from '@threlte/core';
import { untrack } from 'svelte';
import { Group } from 'three';
import { useCollisionGroups } from '../../../hooks/useCollisionGroups.svelte.js';
import { useRapier } from '../../../hooks/useRapier.js';
import { useRigidBody, useRigidBodyEvents } from '../../../hooks/useRigidBody.js';
import { applyColliderActiveEvents } from '../../../lib/applyColliderActiveEvents.js';
import { createCollidersFromChildren } from '../../../lib/createCollidersFromChildren.js';
import { eulerToQuaternion } from '../../../lib/eulerToQuaternion.js';
import { useParentRigidbodyObject } from '../../../lib/rigidBodyObjectContext.js';

export default function AutoColliders($$anchor, $$props) {
	$.push($$props, true);

	const $parent3DObject = () => $.store_get(parent3DObject, '$parent3DObject', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let shape = $.prop($$props, 'shape', 3, 'convexHull'),
		colliders = $.prop($$props, 'colliders', 15);

	const group = new Group();
	const rigidBody = useRigidBody();
	const rigidBodyEvents = useRigidBodyEvents();
	const rigidBodyParentObject = useParentRigidbodyObject();
	const { world, addColliderToContext, removeColliderFromContext } = useRapier();
	const collisionGroups = useCollisionGroups();

	const events = $.derived(() => ({
		oncollisionenter: $$props.oncollisionenter,
		oncollisionexit: $$props.oncollisionexit,
		oncontact: $$props.oncontact,
		onsensorenter: $$props.onsensorenter,
		onsensorexit: $$props.onsensorexit
	}));

	const cleanup = () => {
		if (colliders() === undefined) return;

		collisionGroups.removeColliders(colliders());

		colliders().forEach((c) => {
			removeColliderFromContext(c);
			world.removeCollider(c, true);
		});

		colliders(colliders().length = 0, true);
	};

	const create = () => {
		cleanup();
		colliders(createCollidersFromChildren(group, shape() ?? 'convexHull', world, rigidBody.current, rigidBodyParentObject.current));
		colliders().forEach((c) => addColliderToContext(c, group, $.get(events)));
		collisionGroups.registerColliders(colliders());

		for (const collider of colliders()) {
			applyColliderActiveEvents(collider, $.get(events), rigidBodyEvents.current);
			collider.setActiveCollisionTypes(ActiveCollisionTypes.ALL);
			collider.setRestitution($$props.restitution ?? 0);
			collider.setRestitutionCombineRule($$props.restitutionCombineRule ?? CoefficientCombineRule.Average);
			collider.setFriction($$props.friction ?? 0.7);
			collider.setFrictionCombineRule($$props.frictionCombineRule ?? CoefficientCombineRule.Average);
			collider.setSensor($$props.sensor ?? false);
			collider.setContactForceEventThreshold($$props.contactForceEventThreshold ?? 0);

			if ($$props.density) {
				collider.setDensity($$props.density);
			}

			if ($$props.mass) {
				if ($$props.centerOfMass && $$props.principalAngularInertia && $$props.angularInertiaLocalFrame) collider.setMassProperties(
					$$props.mass,
					{
						x: $$props.centerOfMass[0],
						y: $$props.centerOfMass[1],
						z: $$props.centerOfMass[2]
					},
					{
						x: $$props.principalAngularInertia[0],
						y: $$props.principalAngularInertia[1],
						z: $$props.principalAngularInertia[2]
					},
					eulerToQuaternion($$props.angularInertiaLocalFrame)
				); else collider.setMass($$props.mass);
			}
		}
	};

	$.user_effect(() => {
		if (!colliders()) return;

		const currentRigidBodyEvents = rigidBodyEvents.current;

		for (const collider of colliders()) {
			addColliderToContext(collider, group, $.get(events));
			applyColliderActiveEvents(collider, $.get(events), currentRigidBodyEvents);
		}
	});

	/**
	 * Refresh the colliders.
	 */
	const refresh = () => create();

	$.user_effect(() => {
		return untrack(() => {
			create();

			return cleanup;
		});
	});

	const parent3DObject = useParentObject3D();

	createParentObject3DContext(group);

	$.user_pre_effect(() => {
		$parent3DObject()?.add(group);

		return () => {
			$parent3DObject()?.remove(group);
		};
	});

	$.user_effect(() => {
		if (colliders()) {
			return untrack(() => {
				if (colliders()) {
					return $$props.oncreate?.(colliders());
				}
			});
		}
	});

	var $$exports = { refresh };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ colliders: colliders() ?? [], refresh }));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}