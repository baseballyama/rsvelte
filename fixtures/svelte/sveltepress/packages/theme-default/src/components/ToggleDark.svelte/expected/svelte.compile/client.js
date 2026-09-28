import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Moon from './icons/Moon.svelte';
import Sun from './icons/Sun.svelte';
import SystemDefault from './icons/SystemDefault.svelte';
import { darkMode, isDark } from './layout';

var root = $.from_html(`<meta id="theme-color" name="theme-color"/> <!>`, 1);
var root_1 = $.from_html(`<div class="toggle svelte-1un7iyc" aria-label="Toggle dark mode" role="button" tabindex="0"><!></div>`);

export default function ToggleDark($$anchor, $$props) {
	$.push($$props, true);

	const $darkMode = () => $.store_get(darkMode, '$darkMode', $$stores);
	const $isDark = () => $.store_get(isDark, '$isDark', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const key = 'SVELTEPRESS_DARK_MODE';
	const themeColor = themeOptions.themeColor || { light: '#fff', dark: '#000' };

	function addOrRemoveClass() {
		localStorage.setItem(key, $darkMode());

		if ($isDark()) {
			document.querySelector('html').classList.add('dark');

			if (themeColor) {
				document.getElementById('theme-color')?.setAttribute('content', themeColor.dark);
			}
		} else {
			document.querySelector('html').classList.remove('dark');

			if (themeColor) {
				document.getElementById('theme-color')?.setAttribute('content', themeColor.light);
			}
		}
	}

	function toggle(evt) {
		const isAppearanceTransition = document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (!isAppearanceTransition) {
			if (darkMode === 'light') {
				$.store_set(darkMode, 'dark');
				$.store_set(isDark, true);
			} else if (darkMode === 'dark') {
				$.store_set(darkMode, 'auto');
				$.store_set(isDark, window.matchMedia('(prefers-color-scheme: dark)').matches);
			} else if (darkMode === 'auto') {
				$.store_set(darkMode, 'light');
				$.store_set(isDark, false);
			}

			addOrRemoveClass();

			return;
		}

		const x = evt.clientX;
		const y = evt.clientY;
		const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
		let needTransition = false;

		if ($darkMode() === 'light') {
			$.store_set(darkMode, 'dark');
			$.store_set(isDark, true);
			needTransition = true;
		} else if ($darkMode() === 'dark') {
			$.store_set(darkMode, 'auto');
			$.store_set(isDark, window.matchMedia('(prefers-color-scheme: dark)').matches);
			needTransition = !$isDark();
		} else if ($darkMode() === 'auto') {
			$.store_set(darkMode, 'light');
			$.store_set(isDark, false);
			needTransition = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}

		if (!needTransition) {
			tick().then(addOrRemoveClass);

			return;
		}

		const transition = document.startViewTransition(async () => {
			await tick();
			addOrRemoveClass();
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`
			];

			document.documentElement.animate({ clipPath: $isDark() ? [...clipPath].reverse() : clipPath }, {
				duration: 400,
				easing: $isDark() ? 'ease-out' : 'ease-in',
				pseudoElement: $isDark()
					? '::view-transition-old(root)'
					: '::view-transition-new(root)'
			});
		});
	}

	function handleColorSchemeChange(e) {
		if ($darkMode() === 'auto') {
			if (e.matches) {
				$.store_set(isDark, true);
			} else {
				$.store_set(isDark, false);
			}

			addOrRemoveClass();
		}
	}

	let mediaQuery;

	if (browser) {
		let storedMode = window.localStorage.getItem(key);

		if (storedMode !== 'light' && storedMode !== 'dark' && storedMode !== 'auto') {
			storedMode = 'auto';
			window.localStorage.setItem(key, storedMode);
		}

		$.store_set(darkMode, storedMode);
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		handleColorSchemeChange(mediaQuery);
	}

	onMount(() => {
		mediaQuery?.addEventListener('change', handleColorSchemeChange);

		return () => {
			mediaQuery?.removeEventListener('change', handleColorSchemeChange);
		};
	});

	var div = root_1();

	$.head('1un7iyc', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var node = $.sibling(meta, 2);

		$.html(node, () => `
<${'script'}>
  const themeColor = JSON.parse('${JSON.stringify(themeColor)}')
  const storedMode = window.localStorage.getItem('${key}')
  if (storedMode === 'dark' || (storedMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.querySelector('html').classList.add('dark')
    document.getElementById('theme-color')?.setAttribute('content', themeColor ? themeColor.dark : '#ffffff')
  }
  else {
    document.querySelector('html').classList.remove('dark')
    document.getElementById('theme-color')?.setAttribute('content', themeColor ? themeColor.light : '#ffffff')
  }
</${'script'}>`);

		$.template_effect(() => $.set_attribute(meta, 'content', themeColor.light || '#fff'));
		$.append($$anchor, fragment);
	});

	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			SystemDefault($$anchor, {});
		};

		var consequent_1 = ($$anchor) => {
			Moon($$anchor, {});
		};

		var consequent_2 = ($$anchor) => {
			Sun($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if ($darkMode() === 'auto') $$render(consequent); else if ($darkMode() === 'dark') $$render(consequent_1, 1); else if ($darkMode() === 'light') $$render(consequent_2, 2);
		});
	}

	$.reset(div);
	$.delegated('click', div, toggle);
	$.delegated('keyup', div, () => {});
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keyup']);