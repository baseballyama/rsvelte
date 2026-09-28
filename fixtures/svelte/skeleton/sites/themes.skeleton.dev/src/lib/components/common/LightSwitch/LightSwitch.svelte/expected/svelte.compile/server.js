import * as $ from 'svelte/internal/server';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';

export default function LightSwitch($$renderer) {
	const FALLBACK = 'light';
	let mode = typeof window === 'undefined' ? FALLBACK : localStorage.getItem('mode') ?? FALLBACK;

	function setMode(newMode) {
		document.documentElement.setAttribute('data-mode', newMode);
		localStorage.setItem('mode', newMode);
		mode = newMode;
	}

	$$renderer.push(`<button class="btn-icon hover:preset-tonal" role="switch"${$.attr('aria-checked', mode === 'dark')} title="Toggle dark mode." aria-label="Toggle dark mode.">`);

	if (mode === 'dark') {
		$$renderer.push('<!--[0-->');
		MoonIcon($$renderer, { class: 'size-5' });
	} else {
		$$renderer.push('<!--[-1-->');
		SunIcon($$renderer, { class: 'size-5' });
	}

	$$renderer.push(`<!--]--></button>`);
}