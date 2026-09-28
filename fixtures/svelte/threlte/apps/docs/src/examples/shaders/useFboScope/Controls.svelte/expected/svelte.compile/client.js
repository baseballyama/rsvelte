import 'svelte/internal/disclose-version';
import { writable } from 'svelte/store';
import { Tween } from 'svelte/motion';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';
import { Quaternion, Vector3, MathUtils } from 'three';

export const baseFov = 60;
export const scoping = writable(false);
export const zoomedFov = new Tween(18, { duration: 200 });

export default function Controls($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const $scoping = () => $.store_get(scoping, '$scoping', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { dom, camera } = useThrelte();

	// Pointer lock with unadjusted movement: https://github.com/slightlyoff/unadjusted_pointer_lock_explainer
	const requestPointerLock = (myTargetElement) => {
		const promise = myTargetElement.requestPointerLock({ unadjustedMovement: true });

		if (!promise) {
			console.log('disabling mouse acceleration is not supported, locking pointer without it');

			return;
		}

		return promise.then().catch((error) => {
			console.log(error);
		});
	};

	let pointerLocked = $.state(false);

	/*
			Zoom in and out with mousewheel.
			I used a passive listener on the dom element because in the docs we show
			examples as an iframe. Its interaction with locking pointer was causing the page
			to scroll etc.
		*/
	dom.addEventListener(
		'wheel',
		(e) => {
			if ($.get(pointerLocked)) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				zoomedFov.set(MathUtils.clamp(zoomedFov.current + e.deltaY * 0.05, 0.5, baseFov * 0.5));
			}
		},
		{ passive: false }
	);

	let mouseSensitivity = $.derived(() => 0.00008 * MathUtils.clamp(zoomedFov.current * 0.5, 1, 20));
	let phi = $.state(0);
	let theta = $.state(-0.16);
	const qx = new Quaternion();
	const qz = new Quaternion();

	useTask(() => {
		qx.setFromAxisAngle(new Vector3(0, -1, 0), $.get(phi));
		qz.setFromAxisAngle(new Vector3(1, 0, 0), $.get(theta));

		const cameraQuaternion = new Quaternion();

		cameraQuaternion.multiply(qx);
		cameraQuaternion.multiply(qz);
		$camera().quaternion.copy(cameraQuaternion);
	});

	$.user_effect(() => {
		return () => {
			document.exitPointerLock();
		};
	});

	$.user_effect(() => {
		const onchange = () => {
			$.set(pointerLocked, document.pointerLockElement ? true : false, true);
		};

		document.addEventListener('pointerlockchange', onchange);

		return () => document.removeEventListener('pointerlockchange', onchange);
	});

	$.event('keydown', $.document, (e) => {
		if (e.key === 's') scoping.set(!$scoping());
		if (e.key === 'a') zoomedFov.set(Math.min(zoomedFov.current + 2, baseFov * 0.5));
		if (e.key === 'd') zoomedFov.set(Math.max(0.5, zoomedFov.current - 2));
	});

	$.event('click', $.document, () => {
		if (!$.get(pointerLocked)) {
			requestPointerLock(dom);
		}
	});

	$.event('mousemove', $.document, ({ movementX, movementY }) => {
		if (!$.get(pointerLocked)) return;

		$.set(phi, $.get(phi) + movementX * $.get(mouseSensitivity));
		$.set(theta, $.get(theta) - movementY * $.get(mouseSensitivity) * 1.5);
	});

	$.pop();
	$$cleanup();
}