import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function RigidBody($$anchor, $$props) {
	$.push($$props, true);

	const $parent3DObject = () => $.store_get(parent3DObject, '$parent3DObject', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const {
		world,
		rapier,
		addRigidBodyToContext,
		removeRigidBodyFromContext
	} = useRapier();

	let type = $.prop($$props, 'type', 3, 'dynamic'),
		canSleep = $.prop($$props, 'canSleep', 3, true),
		gravityScale = $.prop($$props, 'gravityScale', 3, 1),
		ccd = $.prop($$props, 'ccd', 3, false),
		angularDamping = $.prop($$props, 'angularDamping', 3, 0),
		linearDamping = $.prop($$props, 'linearDamping', 3, 0),
		lockRotations = $.prop($$props, 'lockRotations', 3, false),
		lockTranslations = $.prop($$props, 'lockTranslations', 3, false),
		enabledRotations = $.prop($$props, 'enabledRotations', 19, () => [true, true, true]),
		enabledTranslations = $.prop($$props, 'enabledTranslations', 19, () => [true, true, true]),
		dominance = $.prop($$props, 'dominance', 3, 0),
		enabled = $.prop($$props, 'enabled', 3, true),
		userData = $.prop($$props, 'userData', 19, () => ({})),
		rigidBody = $.prop($$props, 'rigidBody', 15);

	const object = new Object3D();

	initializeRigidBodyUserData(object);

	/**
	 * isSleeping used for events "sleep" and "wake" in `createPhysicsTasks`
	 */
	object.userData.isSleeping = false;

	/**
	 * RigidBody Description
	 */
	const desc = new rapier.RigidBodyDesc(parseRigidBodyType(untrack(() => type()))).setCanSleep(untrack(() => canSleep()));

	/**
	 * Temporary RigidBody init
	 */
	let rigidBodyInternal = $.derived(() => world.createRigidBody(desc));

	overrideTeleportMethods(() => $.get(rigidBodyInternal), () => object);

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
		$.get(rigidBodyInternal).setTranslation(worldPosition, true);
		$.get(rigidBodyInternal).setRotation(worldQuaternion, true);
	};

	/**
	 * Stored on userData so per-frame loops can read it without a wasm round-trip
	 * through `world.getRigidBody(handle)`.
	 */
	$.user_effect(() => {
		object.userData.rigidBody = $.get(rigidBodyInternal);
	});

	$.user_effect(() => {
		$.get(rigidBodyInternal).setBodyType(parseRigidBodyType(type()), true);
	});

	$.user_effect(() => {
		if ($$props.linearVelocity) {
			$.get(rigidBodyInternal).setLinvel(
				{
					x: $$props.linearVelocity[0],
					y: $$props.linearVelocity[1],
					z: $$props.linearVelocity[2]
				},
				true
			);
		}
	});

	$.user_effect(() => {
		if ($$props.angularVelocity) {
			$.get(rigidBodyInternal).setAngvel(
				{
					x: $$props.angularVelocity[0],
					y: $$props.angularVelocity[1],
					z: $$props.angularVelocity[2]
				},
				true
			);
		}
	});

	$.user_effect(() => $.get(rigidBodyInternal).setGravityScale(gravityScale(), true));
	$.user_effect(() => $.get(rigidBodyInternal).enableCcd(ccd()));
	$.user_effect(() => $.get(rigidBodyInternal).setDominanceGroup(dominance()));
	$.user_effect(() => $.get(rigidBodyInternal).lockRotations(lockRotations(), true));
	$.user_effect(() => $.get(rigidBodyInternal).lockTranslations(lockTranslations(), true));
	$.user_effect(() => $.get(rigidBodyInternal).setEnabledRotations(...enabledRotations(), true));
	$.user_effect(() => $.get(rigidBodyInternal).setEnabledTranslations(...enabledTranslations(), true));
	$.user_effect(() => $.get(rigidBodyInternal).setAngularDamping(angularDamping()));
	$.user_effect(() => $.get(rigidBodyInternal).setLinearDamping(linearDamping()));
	$.user_effect(() => $.get(rigidBodyInternal).setEnabled(enabled()));

	const events = $.derived(() => ({
		oncollisionenter: $$props.oncollisionenter,
		oncollisionexit: $$props.oncollisionexit,
		oncontact: $$props.oncontact,
		onsensorenter: $$props.onsensorenter,
		onsensorexit: $$props.onsensorexit,
		onsleep: $$props.onsleep,
		onwake: $$props.onwake
	}));

	/**
	 * Add userData to the rigidBody
	 */
	$.user_effect(() => {
		$.get(rigidBodyInternal).userData = { events: $.get(events), ...userData() };
		addRigidBodyToContext($.get(rigidBodyInternal), object, $.get(events));
	});

	/**
	 * Setting the RigidBody context so that colliders can
	 * hook onto.
	 */
	provideRigidbody(() => $.get(rigidBodyInternal));

	provideRigidBodyEvents(() => $.get(events));

	/**
	 * Used by child colliders to restore transform
	 */
	setParentRigidbodyObject(() => object);

	$.user_effect(() => {
		const currentRigidBody = $.get(rigidBodyInternal);

		return () => {
			removeRigidBodyFromContext(currentRigidBody);
			world.removeRigidBody(currentRigidBody);
		};
	});

	const parent3DObject = useParentObject3D();

	createParentObject3DContext(object);

	$.user_pre_effect(() => {
		$parent3DObject()?.add(object);

		return () => {
			$parent3DObject()?.remove(object);
		};
	});

	$.user_effect(() => {
		if ($.get(rigidBodyInternal)) {
			return untrack(() => {
				initPosition();
				rigidBody($.get(rigidBodyInternal));

				return $$props.oncreate?.(rigidBody());
			});
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ rigidBody: $.get(rigidBodyInternal) }));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}