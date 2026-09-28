import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';

var root = $.from_html(`<button class="btn-icon hover:preset-tonal" role="switch" title="Toggle dark mode." aria-label="Toggle dark mode."><!></button>`);

export default function LightSwitch($$anchor) {
	const FALLBACK = 'light';
	let mode = $.state($.proxy(typeof window === 'undefined' ? FALLBACK : localStorage.getItem('mode') ?? FALLBACK));

	function setMode(newMode) {
		document.documentElement.setAttribute('data-mode', newMode);
		localStorage.setItem('mode', newMode);
		$.set(mode, newMode, true);
	}

	var button = root();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			MoonIcon($$anchor, { class: 'size-5' });
		};

		var alternate = ($$anchor) => {
			SunIcon($$anchor, { class: 'size-5' });
		};

		$.if(node, ($$render) => {
			if ($.get(mode) === 'dark') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.template_effect(() => $.set_attribute(button, 'aria-checked', $.get(mode) === 'dark'));
	$.delegated('click', button, () => setMode($.get(mode) === 'dark' ? 'light' : 'dark'));
	$.append($$anchor, button);
}

$.delegate(['click']);