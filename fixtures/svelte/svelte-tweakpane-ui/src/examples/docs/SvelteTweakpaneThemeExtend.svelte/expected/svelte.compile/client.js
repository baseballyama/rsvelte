import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemeExtend($$anchor, $$props) {
	$.push($$props, true);

	const customizedTheme = {
		...ThemeUtils.presets.iceberg,
		baseBackgroundColor: 'hsla(230, 20%, 11%, 0.5)',
		labelForegroundColor: 'hsla(230, 12%, 88%, 1.00)'
	};

	Button($$anchor, {
		label: 'I\'m customized',
		get theme() {
			return customizedTheme;
		}
	});

	$.pop();
}