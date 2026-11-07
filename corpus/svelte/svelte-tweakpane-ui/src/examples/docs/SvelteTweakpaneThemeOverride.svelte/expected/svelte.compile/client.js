import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib';

export default function SvelteTweakpaneThemeOverride($$anchor) {
	Button($$anchor, {
		label: 'Rounded Parent Button',
		theme: { baseBorderRadius: '6px' }
	});
}