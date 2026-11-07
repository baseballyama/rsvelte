import * as $ from 'svelte/internal/server';
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

export default function AutoColliders($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			shape = 'convexHull',
			restitution,
			restitutionCombineRule,
			friction,
			frictionCombineRule,
			sensor,
			contactForceEventThreshold,
			density,
			mass,
			centerOfMass,
			principalAngularInertia,
			angularInertiaLocalFrame,
			colliders = void 0,
			oncreate,
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit,
			children
		} = $$props;

		const group = new Group();
		const rigidBody = useRigidBody();
		const rigidBodyEvents = useRigidBodyEvents();
		const rigidBodyParentObject = useParentRigidbodyObject();
		const { world, addColliderToContext, removeColliderFromContext } = useRapier();
		const collisionGroups = useCollisionGroups();

		const events = $.derived(() => ({
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit
		}));

		const cleanup = () => {
			if (colliders === undefined) return;

			collisionGroups.removeColliders(colliders);

			colliders.forEach((c) => {
				removeColliderFromContext(c);
				world.removeCollider(c, true);
			});

			colliders.length = 0;
		};

		const create = () => {
			cleanup();
			colliders = createCollidersFromChildren(group, shape ?? 'convexHull', world, rigidBody.current, rigidBodyParentObject.current);
			colliders.forEach((c) => addColliderToContext(c, group, events()));
			collisionGroups.registerColliders(colliders);

			for (const collider of colliders) {
				applyColliderActiveEvents(collider, events(), rigidBodyEvents.current);
				collider.setActiveCollisionTypes(ActiveCollisionTypes.ALL);
				collider.setRestitution(restitution ?? 0);
				collider.setRestitutionCombineRule(restitutionCombineRule ?? CoefficientCombineRule.Average);
				collider.setFriction(friction ?? 0.7);
				collider.setFrictionCombineRule(frictionCombineRule ?? CoefficientCombineRule.Average);
				collider.setSensor(sensor ?? false);
				collider.setContactForceEventThreshold(contactForceEventThreshold ?? 0);

				if (density) {
					collider.setDensity(density);
				}

				if (mass) {
					if (centerOfMass && principalAngularInertia && angularInertiaLocalFrame) collider.setMassProperties(
						mass,
						{ x: centerOfMass[0], y: centerOfMass[1], z: centerOfMass[2] },
						{
							x: principalAngularInertia[0],
							y: principalAngularInertia[1],
							z: principalAngularInertia[2]
						},
						eulerToQuaternion(angularInertiaLocalFrame)
					); else collider.setMass(mass);
				}
			}
		};

		/**
		 * Refresh the colliders.
		 */
		const refresh = () => create();

		const parent3DObject = useParentObject3D();

		createParentObject3DContext(group);
		children?.($$renderer, { colliders: colliders ?? [], refresh });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { colliders, refresh });
	});
}