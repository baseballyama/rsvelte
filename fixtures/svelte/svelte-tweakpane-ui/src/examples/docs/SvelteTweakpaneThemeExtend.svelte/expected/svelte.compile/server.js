import * as $ from 'svelte/internal/server';
import { Button, ThemeUtils } from '$lib';

export default function SvelteTweakpaneThemeExtend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const customizedTheme = {
			...ThemeUtils.presets.iceberg,
			baseBackgroundColor: 'hsla(230, 20%, 11%, 0.5)',
			labelForegroundColor: 'hsla(230, 12%, 88%, 1.00)'
		};

		Button($$renderer, { label: 'I\'m customized', theme: customizedTheme });
	});
}