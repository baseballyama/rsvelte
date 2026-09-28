import * as $ from 'svelte/internal/server';
import { Button } from '$lib';

export default function SvelteTweakpaneThemeOverride($$renderer) {
	Button($$renderer, {
		label: 'Rounded Parent Button',
		theme: { baseBorderRadius: '6px' }
	});
}