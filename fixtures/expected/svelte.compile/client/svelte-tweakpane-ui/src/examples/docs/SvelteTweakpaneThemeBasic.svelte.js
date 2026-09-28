import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemeBasic($$anchor, $$props) {
	$.push($$props, true);

	Button($$anchor, {
		label: 'Jet Black Button',
		get theme() {
			return ThemeUtils.presets.jetblack;
		}
	});

	$.pop();
}