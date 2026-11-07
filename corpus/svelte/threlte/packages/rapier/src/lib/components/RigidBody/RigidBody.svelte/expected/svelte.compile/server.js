import * as $ from 'svelte/internal/server';
import { createParentObject3DContext, useParentObject3D } from '@threlte/core';
import { untrack } from 'svelte';
import { Object3D, Vector3 } from 'three';
import { useRapier } from '../../hooks/useRapier.js';
import { initializeRigidBodyUserData, setInitialRigidBodyState } from '../../lib/createPhysicsTasks.js';
import { getWorldPosition, getWorldQuaternion, getWorldScale } from '../../lib/getWorldTransforms.js';
import { parseRigidBodyType } from '../../lib/parseRigidBodyType.js';
import { setParentRigidbodyObject } from '../../lib/rigidBodyObjectContext.js';
import { overrideTeleportMethods } from './overrideTeleportMethods.svelte.js';
import { provideRigidbody, provideRigidBodyEvents } from '../../hooks/useRigidBody.js';

export default function RigidBody($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const {
			world,
			rapier,
			addRigidBodyToContext,
			removeRigidBodyFromContext
		} = useRapier();

		let {
			linearVelocity,
			angularVelocity,
			type = 'dynamic',
			canSleep = true,
			gravityScale = 1,
			ccd = false,
			angularDamping = 0,
			linearDamping = 0,
			lockRotations = false,
			lockTranslations = false,
			enabledRotations = [true, true, true],
			enabledTranslations = [true, true, true],
			dominance = 0,
			enabled = true,
			userData = {},
			rigidBody = void 0,
			oncreate,
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit,
			onsleep,
			onwake,
			children
		} = $$props;

		const object = new Object3D();

		initializeRigidBodyUserData(object);

		/**
		 * isSleeping used for events "sleep" and "wake" in `createPhysicsTasks`
		 */
		object.userData.isSleeping = false;

		/**
		 * RigidBody Description
		 */
		const desc = new rapier.RigidBodyDesc(parseRigidBodyType(untrack(() => type))).setCanSleep(untrack(() => canSleep));

		/**
		 * Temporary RigidBody init
		 */
		let rigidBodyInternal = $.derived(() => world.createRigidBody(desc));

		overrideTeleportMethods(() => rigidBodyInternal(), () => object);

		/**
		 * Apply transforms now that the parent component has added "object" to itself.
		 * Runs synchronously inside the bindable `$effect` below, after `$effect.pre`
		 * has parented `object`, so `bind:rigidBody` and `oncreate` both fire with the
		 * body already at its intended world position.
		 */
		const initPosition = () => {
			object.updateMatrix();
			object.updateWorldMatrix(true, false);

			const parentWorldScale = object.parent ? getWorldScale(object.parent) : new Vector3(1, 1, 1);
			const worldPosition = getWorldPosition(object).multiply(parentWorldScale);
			const worldQuaternion = getWorldQuaternion(object);

			setInitialRigidBodyState(object, worldPosition, worldQuaternion);
			rigidBodyInternal().setTranslation(worldPosition, true);
			rigidBodyInternal().setRotation(worldQuaternion, true);
		};

		/**
		 * Stored on userData so per-frame loops can read it without a wasm round-trip
		 * through `world.getRigidBody(handle)`.
		 */
		const events = $.derived(() => ({
			oncollisionenter,
			oncollisionexit,
			oncontact,
			onsensorenter,
			onsensorexit,
			onsleep,
			onwake
		}));

		/**
		 * Add userData to the rigidBody
		 */
		/**
		 * Setting the RigidBody context so that colliders can
		 * hook onto.
		 */
		provideRigidbody(() => rigidBodyInternal());

		provideRigidBodyEvents(() => events());

		/**
		 * Used by child colliders to restore transform
		 */
		setParentRigidbodyObject(() => object);

		const parent3DObject = useParentObject3D();

		createParentObject3DContext(object);
		children?.($$renderer, { rigidBody: rigidBodyInternal() });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { rigidBody });
	});
}