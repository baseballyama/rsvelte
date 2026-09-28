import * as $ from 'svelte/internal/server';
import { Button, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemeBasic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Button($$renderer, {
			label: 'Jet Black Button',
			theme: ThemeUtils.presets.jetblack
		});
	});
}