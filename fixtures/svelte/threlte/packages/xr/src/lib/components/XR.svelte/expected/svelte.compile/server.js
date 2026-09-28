import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { useThrelte } from '@threlte/core';

import {
	isPresenting,
	lastSessionRequest,
	pointerIntersection,
	referenceSpaceType,
	session,
	teleportIntersection,
	xr
} from '../internal/state.svelte.js';

import { setupRaf } from '../internal/setupRaf.svelte.js';
import { setupHeadset } from '../internal/setupHeadset.svelte.js';
import { setupInputSources } from '../internal/setupInputSources.js';
import { dispatchXRInputSourceEvent } from '../internal/inputSources.svelte.js';
import { defaultFeatures } from '../internal/defaultFeatures.js';
import { getXRSessionOptions } from '../lib/getXRSessionOptions.js';
import { toggleXRSession } from '../lib/toggleXRSession.js';

export default function XR($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const INPUT_SOURCE_EVENTS = [
			'select',
			'selectstart',
			'selectend',
			'squeeze',
			'squeezestart',
			'squeezeend'
		];

		/**
		 * Enables foveated rendering. Default is `1`, the three.js default.
		 *
		 * 0 = no foveation, full resolution
		 *
		 * 1 = maximum foveation, the edges render at lower resolution
		 */
		/**
		 * The target framerate for the XRSystem. Smaller rates give more CPU headroom at the cost of responsiveness.
		 * Recommended range is `72`-`120`. Default is unset and left to the device.
		 * @note If your experience cannot effectively reach the target framerate, it will be subject to frame reprojection
		 * which will halve the effective framerate. Choose a conservative estimate that balances responsiveness and
		 * headroom based on your experience.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API/Rendering#refresh_rate_and_frame_rate
		 */
		/** Type of WebXR reference space to use. Default is `local-floor` */
		/** Called as an XRSession is started */
		/** Called after an XRSession is ended */
		/** Optionally provide custom XRHandModelFactory */
		/** Optionally provide custom XRControllerModelFactory */
		/** Called when an XRSession is hidden or unfocused. */
		/** Called when available inputsources change */
		/** Called when the session frame rate changes. */
		/**
		 * Auto-enter a session when the OS grants one without an explicit request
		 * (e.g. when the user puts on a headset). Pass `false` to disable, or an
		 * array of modes to restrict which modes are eligible.
		 * @default true
		 */
		/**
		 * Pre-offer a session via `navigator.xr.offerSession` so the browser can
		 * show its own entry UI (e.g. Vision Pro). When `true`, offers AR if
		 * supported, otherwise VR. Pass a specific mode to restrict. Pass `false`
		 * to disable.
		 * @default true
		 */
		let {
			foveation = 1,
			frameRate,
			referenceSpace = 'local-floor',
			onsessionstart,
			onsessionend,
			onvisibilitychange,
			oninputsourceschange,
			onframeratechange,
			enterGrantedSession = true,
			offerSession = true,
			fallback,
			children,
			handFactory,
			controllerFactory
		} = $$props;

		const { renderer, renderMode } = useThrelte();

		setupRaf();
		setupHeadset();

		const bindInputSources = setupInputSources(controllerFactory, handFactory);

		const handleSessionStart = (event) => {
			isPresenting.current = true;
			onsessionstart?.(event);
		};

		const handleSessionEnd = (event) => {
			onsessionend?.(event);
			isPresenting.current = false;
			session.current = undefined;
			pointerIntersection.left = undefined;
			pointerIntersection.right = undefined;
			teleportIntersection.left = undefined;
			teleportIntersection.right = undefined;
		};

		const handleVisibilityChange = (event) => {
			onvisibilitychange?.(event);
		};

		const handleInputSourcesChange = (event) => {
			oninputsourceschange?.(event);
		};

		const handleFramerateChange = (event) => {
			onframeratechange?.(event);
		};

		const handleXRInputEvent = (event) => {
			dispatchXRInputSourceEvent(event);
		};

		if (// Capture the mode from before we forced 'always' so it survives
		// any manual renderMode changes made during the session.
		// if unmounted while presenting (e.g. due to sveltekit navigation), end the session
		// Do nothing
		// Prefer to replay whatever mode + sessionInit the app entered with last.
		// user declined or offer was rejected
		isPresenting.current) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
			fallback?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}