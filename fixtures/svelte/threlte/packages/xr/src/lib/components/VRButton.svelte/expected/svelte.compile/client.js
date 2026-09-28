import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XRButton from './XRButton.svelte';
import { defaultFeatures } from '../internal/defaultFeatures.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function VRButton($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => ({ ...defaultFeatures }));

		XRButton($$anchor, $.spread_props(
			{
				get sessionInit() {
					return $.get($0);
				}
			},
			() => props,
			{ mode: 'immersive-vr' }
		));
	}
}