import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function XR($$anchor, $$props) {
	$.push($$props, true);

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
	let foveation = $.prop($$props, 'foveation', 3, 1),
		referenceSpace = $.prop($$props, 'referenceSpace', 3, 'local-floor'),
		enterGrantedSession = $.prop($$props, 'enterGrantedSession', 3, true),
		offerSession = $.prop($$props, 'offerSession', 3, true);

	const { renderer, renderMode } = useThrelte();

	setupRaf();
	setupHeadset();

	const bindInputSources = setupInputSources($$props.controllerFactory, $$props.handFactory);

	const handleSessionStart = (event) => {
		isPresenting.current = true;
		$$props.onsessionstart?.(event);
	};

	const handleSessionEnd = (event) => {
		$$props.onsessionend?.(event);
		isPresenting.current = false;
		session.current = undefined;
		pointerIntersection.left = undefined;
		pointerIntersection.right = undefined;
		teleportIntersection.left = undefined;
		teleportIntersection.right = undefined;
	};

	const handleVisibilityChange = (event) => {
		$$props.onvisibilitychange?.(event);
	};

	const handleInputSourcesChange = (event) => {
		$$props.oninputsourceschange?.(event);
	};

	const handleFramerateChange = (event) => {
		$$props.onframeratechange?.(event);
	};

	const handleXRInputEvent = (event) => {
		dispatchXRInputSourceEvent(event);
	};

	$.user_effect(() => {
		const currentSession = session.current;

		if (currentSession === undefined) {
			bindInputSources(undefined);

			return;
		}

		bindInputSources(currentSession);
		currentSession.addEventListener('visibilitychange', handleVisibilityChange);
		currentSession.addEventListener('inputsourceschange', handleInputSourcesChange);
		currentSession.addEventListener('frameratechange', handleFramerateChange);
		currentSession.addEventListener('end', handleSessionEnd);

		for (const type of INPUT_SOURCE_EVENTS) {
			currentSession.addEventListener(type, handleXRInputEvent);
		}

		return () => {
			currentSession.removeEventListener('visibilitychange', handleVisibilityChange);
			currentSession.removeEventListener('inputsourceschange', handleInputSourcesChange);
			currentSession.removeEventListener('frameratechange', handleFramerateChange);
			currentSession.removeEventListener('end', handleSessionEnd);

			for (const type of INPUT_SOURCE_EVENTS) {
				currentSession.removeEventListener(type, handleXRInputEvent);
			}

			bindInputSources(undefined);
		};
	});

	$.user_pre_effect(() => {
		if (!isPresenting.current) return;

		// Capture the mode from before we forced 'always' so it survives
		// any manual renderMode changes made during the session.
		const saved = untrack(() => renderMode.current);

		renderMode.set('always');

		return () => {
			renderMode.set(saved);
		};
	});

	$.user_pre_effect(() => {
		xr.current = renderer.xr;
		renderer.xr.enabled = true;
		renderer.xr.addEventListener('sessionstart', handleSessionStart);

		return () => {
			xr.current = undefined;
			renderer.xr.enabled = false;
			renderer.xr.removeEventListener('sessionstart', handleSessionStart);

			// if unmounted while presenting (e.g. due to sveltekit navigation), end the session
			untrack(() => session.current)?.end().catch(() => {});
		};
	});

	$.user_pre_effect(() => {
		if ($$props.frameRate === undefined) return;

		try {
			session.current?.updateTargetFrameRate($$props.frameRate);
		} catch {
			// Do nothing
		}
	});

	$.user_pre_effect(() => {
		renderer.xr.setFoveation(foveation());
	});

	$.user_pre_effect(() => {
		renderer.xr.setReferenceSpaceType(referenceSpace());
		referenceSpaceType.current = referenceSpace();
	});

	$.user_pre_effect(() => {
		if (enterGrantedSession() === false) return;

		const allowed = Array.isArray(enterGrantedSession())
			? enterGrantedSession()
			: ['immersive-ar', 'immersive-vr'];

		const listener = async () => {
			// Prefer to replay whatever mode + sessionInit the app entered with last.
			if (lastSessionRequest.mode !== undefined && allowed.includes(lastSessionRequest.mode)) {
				toggleXRSession(lastSessionRequest.mode, lastSessionRequest.sessionInit, 'enter').catch(() => {});

				return;
			}

			for (const mode of allowed) {
				if (await navigator.xr?.isSessionSupported(mode).catch(() => false)) {
					toggleXRSession(mode, { ...defaultFeatures }, 'enter').catch(() => {});

					return;
				}
			}
		};

		navigator.xr?.addEventListener('sessiongranted', listener);

		return () => {
			navigator.xr?.removeEventListener('sessiongranted', listener);
		};
	});

	$.user_pre_effect(() => {
		if (navigator.xr === undefined) return;
		if (offerSession() === false) return;
		if (!('offerSession' in navigator.xr)) return;
		if (session.current !== undefined) return;

		const manager = xr.current;

		if (manager === undefined) return;

		let cancelled = false;

		const run = async () => {
			let mode;

			if (offerSession() === true) {
				const arSupported = await navigator.xr?.isSessionSupported('immersive-ar').catch(() => false);

				mode = arSupported ? 'immersive-ar' : 'immersive-vr';
			} else {
				mode = offerSession();
			}

			const init = getXRSessionOptions(referenceSpaceType.current, lastSessionRequest.sessionInit, defaultFeatures);

			try {
				const nextSession = await navigator.xr?.offerSession?.(mode, init);

				if (!nextSession || cancelled) return;

				await manager.setSession(nextSession);

				if (cancelled) return;

				lastSessionRequest.mode = mode;
				lastSessionRequest.sessionInit = init;
				session.current = nextSession;
			} catch {
				// user declined or offer was rejected
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.snippet(node_2, () => $$props.fallback ?? $.noop);
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (isPresenting.current) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}