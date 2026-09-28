import * as $ from 'svelte/internal/server';
import { useTask, useThrelte } from '@threlte/core';
import { Quaternion, Vector3, MathUtils } from 'three';
import { writable } from 'svelte/store';
import { Tween } from 'svelte/motion';

export const baseFov = 60;
export const scoping = writable(false);
export const zoomedFov = new Tween(18, { duration: 200 });

export default function Controls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		let pointerLocked = false;

		/*
				Zoom in and out with mousewheel.
				I used a passive listener on the dom element because in the docs we show
				examples as an iframe. Its interaction with locking pointer was causing the page
				to scroll etc.
			*/
		dom.addEventListener(
			'wheel',
			(e) => {
				if (pointerLocked) {
					e.preventDefault();
					e.stopPropagation();
					e.stopImmediatePropagation();
					zoomedFov.set(MathUtils.clamp(zoomedFov.current + e.deltaY * 0.05, 0.5, baseFov * 0.5));
				}
			},
			{ passive: false }
		);

		let mouseSensitivity = $.derived(() => 0.00008 * MathUtils.clamp(zoomedFov.current * 0.5, 1, 20));
		let phi = 0;
		let theta = -0.16;
		const qx = new Quaternion();
		const qz = new Quaternion();

		useTask(() => {
			qx.setFromAxisAngle(new Vector3(0, -1, 0), phi);
			qz.setFromAxisAngle(new Vector3(1, 0, 0), theta);

			const cameraQuaternion = new Quaternion();

			cameraQuaternion.multiply(qx);
			cameraQuaternion.multiply(qz);
			$.store_get($$store_subs ??= {}, '$camera', camera).quaternion.copy(cameraQuaternion);
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}