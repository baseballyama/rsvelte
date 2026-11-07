import * as $ from 'svelte/internal/server';
import XRButton from './XRButton.svelte';
import { defaultFeatures } from '../internal/defaultFeatures.js';

export default function ARButton($$renderer, $$props) {
	let { children, $$slots, $$events, ...props } = $$props;

	XRButton($$renderer, $.spread_props([
		{
			sessionInit: {
				domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
				...defaultFeatures
			}
		},
		props,
		{ mode: 'immersive-ar' }
	]));
}