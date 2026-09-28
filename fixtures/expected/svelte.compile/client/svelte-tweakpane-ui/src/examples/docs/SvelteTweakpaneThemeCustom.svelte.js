import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib';

export default function SvelteTweakpaneThemeCustom($$anchor) {
	const customTheme = {
		baseBackgroundColor: 'hsl(230, 70%, 27%)',
		baseBorderRadius: '6px',
		baseFontFamily: 'sans-serif',
		baseShadowColor: 'rgba(0, 0, 0, 0.2)',
		bladeBorderRadius: '2px',
		bladeHorizontalPadding: '4px',
		bladeValueWidth: '180px',
		buttonBackgroundColor: 'hsl(230, 7%, 70%)',
		buttonBackgroundColorActive: '#d6d7db',
		buttonBackgroundColorFocus: '#c8cad0',
		buttonBackgroundColorHover: '#bbbcc4',
		buttonForegroundColor: 'hsl(230, 7%, 17%)',
		containerBackgroundColor: 'rgba(187, 188, 196, 0.1)',
		containerBackgroundColorActive: 'rgba(187, 188, 196, 0.25)',
		containerBackgroundColorFocus: 'rgba(187, 188, 196, 0.2)',
		containerBackgroundColorHover: 'rgba(187, 188, 196, 0.15)',
		containerForegroundColor: 'hsl(230, 7%, 75%)',
		containerHorizontalPadding: '4px',
		containerUnitSize: '20px',
		containerUnitSpacing: '4px',
		containerVerticalPadding: '4px',
		grooveForegroundColor: 'rgba(187, 188, 196, 0.1)',
		inputBackgroundColor: 'rgba(187, 188, 196, 0.1)',
		inputBackgroundColorActive: 'rgba(187, 188, 196, 0.25)',
		inputBackgroundColorFocus: 'rgba(187, 188, 196, 0.2)',
		inputBackgroundColorHover: 'rgba(187, 188, 196, 0.15)',
		inputForegroundColor: 'hsl(230, 7%, 75%)',
		labelForegroundColor: 'rgba(187, 188, 196, 0.7)',
		monitorBackgroundColor: 'rgba(0, 0, 0, 0.2)',
		monitorForegroundColor: 'rgba(187, 188, 196, 0.7)',
		pluginImageDraggingColor: 'hsla(230, 100%, 66%, 1)'
	};

	Button($$anchor, {
		label: 'I\'m custom',
		get theme() {
			return customTheme;
		}
	});
}