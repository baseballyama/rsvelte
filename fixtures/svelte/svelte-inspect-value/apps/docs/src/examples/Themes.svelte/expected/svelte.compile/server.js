import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import Generic from './Generic.svelte';

export default function Themes($$renderer) {
	const themes = {
		inspect: 'The default, original color scheme designed for this library',
		drak: 'Based on the famous dracula color scheme',
		stereo: 'Based on the great monokai color scheme',
		dark: `Because light hurts your eyes`,
		light: 'Is it bright in here?',
		plain: 'Uses the current font-color and color-mixing to create a dynamic color scheme'
	};

	const builtIns = Object.keys(themes);
	let currentIndex = 0;
	let currentTheme = $.derived(() => builtIns[currentIndex]);

	function setCurrentIndex(dir) {
		currentIndex += dir;

		if (currentIndex === -1) {
			currentIndex = builtIns.length - 1;
		} else if (currentIndex === builtIns.length) {
			currentIndex = 0;
		}
	}

	$$renderer.push(`<div class="themes-container not-content svelte-1v7ol0a"><button>←</button> <div class="flex col" style="flex-basis: 100%">`);

	Generic($$renderer, {
		seeFlashing: true,
		style: 'width: 100%',
		theme: currentTheme(),
		heading: false,
		search: false
	});

	$$renderer.push(`<!----> <!---->`);

	{
		$$renderer.push(`<div style="font-size: 0.8em"><b style="text-transform: capitalize;">${$.escape(currentTheme())}</b> <p>${$.escape(themes[currentTheme()])}</p></div>`);
	}

	$$renderer.push(`<!----></div> <button>→</button></div>`);
}