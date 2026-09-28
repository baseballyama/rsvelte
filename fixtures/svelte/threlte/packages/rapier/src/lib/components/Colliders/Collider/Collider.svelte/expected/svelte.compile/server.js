import * as $ from 'svelte/internal/server';
import { ActiveCollisionTypes, CoefficientCombineRule, ColliderDesc } from '@dimforge/rapier3d-compat';
import { createParentObject3DContext, useParentObject3D, useTask } from '@threlte/core';
import { untrack } from 'svelte';
import { Object3D, Quaternion, Vector3 } from 'three';
import { useCollisionGroups } from '../../../hooks/useCollisionGroups.svelte.js';
import { useRapier } from '../../../hooks/useRapier.js';
import { useRigidBody, useRigidBodyEvents } from '../../../hooks/useRigidBody.js';
import { applyColliderActiveEvents } from '../../../lib/applyColliderActiveEvents.js';
import { eulerToQuaternion } from '../../../lib/eulerToQuaternion.js';
import { getWorldPosition, getWorldQuaternion } from '../../../lib/getWorldTransforms.js';
import { useParentRigidbodyObject } from '../../../lib/rigidBodyObjectContext.js';
import { scaleColliderArgs } from '../../../lib/scaleColliderArgs.js';

export default function Collider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			shape,
			args,
			type,
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
			collider = void 0,
			oncreate,
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit,
			children
		} = $$props;

		const object = new Object3D();
		const rigidBody = useRigidBody();
		const rigidBodyEvents = useRigidBodyEvents();
		const parentRigidBodyObject = useParentRigidbodyObject();
		const hasRigidBodyParent = $.derived(() => rigidBody.current !== undefined);
		const rapierContext = useRapier();
		const { world } = rapierContext;
		const collisionGroups = useCollisionGroups();

		const events = $.derived(() => ({
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit
		}));

		/**
		 * Actual collider setup happens onMount as only then
		 * the transforms are finished.
		 */
		// @ts-expect-error Todo
		/**
		 * Add collider to context
		 */
		/**
		 * For use in conjunction with component <CollisionGroups>
		 */
		const refresh = () => {
			if (!collider) return;

			collider.setTranslation(getWorldPosition(object));
			collider.setRotation(getWorldQuaternion(object));
		};

		/**
		 * If the Collider isAttached (i.e. NOT child of a RigidBody), update the
		 * transforms on every frame.
		 */
		useTask(
			() => {
				refresh();
			},
			{ running: () => !hasRigidBodyParent() && type === 'dynamic' }
		);

		const parent3DObject = useParentObject3D();

		createParentObject3DContext(object);
		children?.($$renderer, { collider });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { collider, refresh });
	});
}