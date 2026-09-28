import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Collider($$anchor, $$props) {
	$.push($$props, true);

	const $parent3DObject = () => $.store_get(parent3DObject, '$parent3DObject', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let collider = $.prop($$props, 'collider', 15);
	const object = new Object3D();
	const rigidBody = useRigidBody();
	const rigidBodyEvents = useRigidBodyEvents();
	const parentRigidBodyObject = useParentRigidbodyObject();
	const hasRigidBodyParent = $.derived(() => rigidBody.current !== undefined);
	const rapierContext = useRapier();
	const { world } = rapierContext;
	const collisionGroups = useCollisionGroups();

	const events = $.derived(() => ({
		oncollisionenter: $$props.oncollisionenter,
		oncollisionexit: $$props.oncollisionexit,
		oncontact: $$props.oncontact,
		onsensorenter: $$props.onsensorenter,
		onsensorexit: $$props.onsensorexit
	}));

	/**
	 * Actual collider setup happens onMount as only then
	 * the transforms are finished.
	 */
	$.user_effect(() => {
		const scale = object.getWorldScale(new Vector3());
		const scaledArgs = scaleColliderArgs($$props.shape, $$props.args, scale);

		// @ts-expect-error Todo
		const colliderDesc = ColliderDesc[$$props.shape](...scaledArgs);

		const currentCollider = world.createCollider(colliderDesc, rigidBody.current);

		currentCollider.setActiveCollisionTypes(ActiveCollisionTypes.ALL);

		/**
		 * Add collider to context
		 */
		rapierContext.addColliderToContext(currentCollider, object, untrack(() => $.get(events)));

		/**
		 * For use in conjunction with component <CollisionGroups>
		 */
		collisionGroups.registerColliders([currentCollider]);

		if ($.get(hasRigidBodyParent)) {
			const rigidBodyWorldPos = new Vector3();
			const rigidBodyWorldQuatInversed = new Quaternion();

			parentRigidBodyObject.current?.getWorldPosition(rigidBodyWorldPos);
			parentRigidBodyObject.current?.getWorldQuaternion(rigidBodyWorldQuatInversed);
			rigidBodyWorldQuatInversed.invert();

			const worldPosition = object.getWorldPosition(new Vector3()).sub(rigidBodyWorldPos);
			const worldRotation = object.getWorldQuaternion(new Quaternion()).premultiply(rigidBodyWorldQuatInversed);

			currentCollider.setTranslationWrtParent(worldPosition);
			currentCollider.setRotationWrtParent(worldRotation);
		} else {
			currentCollider.setTranslation(object.getWorldPosition(new Vector3()));
			currentCollider.setRotation(object.getWorldQuaternion(new Quaternion()));
		}

		collider(currentCollider);

		return () => {
			rapierContext.removeColliderFromContext(currentCollider);
			collisionGroups.removeColliders([currentCollider]);
			world.removeCollider(currentCollider, true);
			collider(undefined);
		};
	});

	$.user_effect(() => {
		collider()?.setRestitution($$props.restitution ?? 0);
	});

	$.user_effect(() => {
		collider()?.setRestitutionCombineRule($$props.restitutionCombineRule ?? CoefficientCombineRule.Average);
	});

	$.user_effect(() => {
		collider()?.setFriction($$props.friction ?? 0.7);
	});

	$.user_effect(() => {
		collider()?.setFrictionCombineRule($$props.frictionCombineRule ?? CoefficientCombineRule.Average);
	});

	$.user_effect(() => {
		collider()?.setSensor($$props.sensor ?? false);
	});

	$.user_effect(() => {
		collider()?.setContactForceEventThreshold($$props.contactForceEventThreshold ?? 0);
	});

	$.user_effect(() => {
		if ($$props.density !== undefined) {
			collider()?.setDensity($$props.density);
		}
	});

	$.user_effect(() => {
		if (collider() && $$props.mass) {
			if ($$props.centerOfMass && $$props.principalAngularInertia && $$props.angularInertiaLocalFrame) {
				collider().setMassProperties(
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
				);
			} else {
				collider().setMass($$props.mass);
			}
		}
	});

	$.user_effect(() => {
		if (collider()) {
			rapierContext.addColliderToContext(collider(), object, $.get(events));
			applyColliderActiveEvents(collider(), $.get(events), rigidBodyEvents.current);
		}
	});

	const refresh = () => {
		if (!collider()) return;

		collider().setTranslation(getWorldPosition(object));
		collider().setRotation(getWorldQuaternion(object));
	};

	/**
	 * If the Collider isAttached (i.e. NOT child of a RigidBody), update the
	 * transforms on every frame.
	 */
	useTask(
		() => {
			refresh();
		},
		{
			running: () => !$.get(hasRigidBodyParent) && $$props.type === 'dynamic'
		}
	);

	const parent3DObject = useParentObject3D();

	createParentObject3DContext(object);

	$.user_pre_effect(() => {
		$parent3DObject()?.add(object);

		return () => {
			$parent3DObject()?.remove(object);
		};
	});

	$.user_effect(() => {
		if (collider()) {
			return untrack(() => {
				if (collider()) {
					return $$props.oncreate?.(collider());
				}
			});
		}
	});

	var $$exports = { refresh };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ collider: collider() }));
	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}