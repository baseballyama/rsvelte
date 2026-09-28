import * as $ from 'svelte/internal/server';
import { getXRSupportState } from '../lib/getXRSupportState.js';
import { toggleXRSession } from '../lib/toggleXRSession.js';
import { isPresenting, xr } from '../internal/state.svelte.js';

export default function XRButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** The type of `XRSession` to create */
		/**
		 * `XRSession` configuration options
		 * @see https://immersive-web.github.io/webxr/#feature-dependencies
		 */
		/** Whether this button should only enter / exit an `XRSession`. Default is to toggle both ways */
		/** Whether to apply automatic styling to the button. Set false to apply custom styles. Default is true. */
		let {
			mode,
			sessionInit,
			force,
			styled = true,
			onclick,
			onerror,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const handleButtonClick = async (nativeEvent, state) => {
			if (!xr.current) {
				throw new Error('The <XR> component was not created. This is required to start an XR session.');
			}

			onclick?.({ state, nativeEvent });

			if (state !== 'supported') return;

			try {
				await toggleXRSession(mode, sessionInit, force);
			} catch(error) {
				/** This callback gets fired if XR initialization fails. */
				onerror?.(error);
			}
		};

		const modeText = $.derived(() => ({ 'immersive-vr': 'VR', 'immersive-ar': 'AR', inline: 'inline' })[mode]);

		const style = $.derived(() => styled
			? `
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border: 1px solid white;
      background: rgba(0, 0, 0, 0.1);
      color: white;
      outline: none;
      z-index: 10;
      ${props.style ?? ''}
    `
			: props.style);

		$.await($$renderer, getXRSupportState(mode), () => {}, (state) => {
			$$renderer.push(`<button${$.attributes({ ...props, style: style() })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer, { state });
				$$renderer.push(`<!---->`);
			} else if (state === 'unsupported') {
				$$renderer.push(`<!--[1-->${$.escape(modeText())} unsupported`);
			} else if (state === 'insecure') {
				$$renderer.push(`<!--[2-->HTTPS needed`);
			} else if (state === 'blocked') {
				$$renderer.push(`<!--[3-->${$.escape(modeText())} blocked`);
			} else if (state === 'supported') {
				$$renderer.push(`<!--[4-->${$.escape(isPresenting.current ? 'Exit' : 'Enter')} ${$.escape(modeText())}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button>`);
		});

		$$renderer.push(`<!--]-->`);
	});
}