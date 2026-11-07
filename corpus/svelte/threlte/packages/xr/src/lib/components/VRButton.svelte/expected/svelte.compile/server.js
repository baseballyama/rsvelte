import * as $ from 'svelte/internal/server';
import XRButton from './XRButton.svelte';
import { defaultFeatures } from '../internal/defaultFeatures.js';

export default function VRButton($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	XRButton($$renderer, $.spread_props([
		{ sessionInit: { ...defaultFeatures } },
		props,
		{ mode: 'immersive-vr' }
	]));
}