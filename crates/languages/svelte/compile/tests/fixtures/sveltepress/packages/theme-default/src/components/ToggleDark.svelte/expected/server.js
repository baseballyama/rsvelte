import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { onMount, tick } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Moon from './icons/Moon.svelte';
import Sun from './icons/Sun.svelte';
import SystemDefault from './icons/SystemDefault.svelte';
import { darkMode, isDark } from './layout';

export default function ToggleDark($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const key = 'SVELTEPRESS_DARK_MODE';
		const themeColor = themeOptions.themeColor || { light: '#fff', dark: '#000' };

		function addOrRemoveClass() {
			localStorage.setItem(key, $.store_get($$store_subs ??= {}, '$darkMode', darkMode));

			if ($.store_get($$store_subs ??= {}, '$isDark', isDark)) {
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

			if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'light') {
				$.store_set(darkMode, 'dark');
				$.store_set(isDark, true);
				needTransition = true;
			} else if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'dark') {
				$.store_set(darkMode, 'auto');
				$.store_set(isDark, window.matchMedia('(prefers-color-scheme: dark)').matches);
				needTransition = !$.store_get($$store_subs ??= {}, '$isDark', isDark);
			} else if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'auto') {
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

				document.documentElement.animate(
					{
						clipPath: $.store_get($$store_subs ??= {}, '$isDark', isDark) ? [...clipPath].reverse() : clipPath
					},
					{
						duration: 400,
						easing: $.store_get($$store_subs ??= {}, '$isDark', isDark) ? 'ease-out' : 'ease-in',
						pseudoElement: $.store_get($$store_subs ??= {}, '$isDark', isDark)
							? '::view-transition-old(root)'
							: '::view-transition-new(root)'
					}
				);
			});
		}

		function handleColorSchemeChange(e) {
			if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'auto') {
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

		$.head('1un7iyc', $$renderer, ($$renderer) => {
			$$renderer.push(`<meta id="theme-color" name="theme-color"${$.attr('content', themeColor.light || '#fff')}/> ${$.html(`
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
</${'script'}>`)}`);
		});

		$$renderer.push(`<div class="toggle svelte-1un7iyc" aria-label="Toggle dark mode" role="button" tabindex="0">`);

		if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'auto') {
			$$renderer.push('<!--[0-->');
			SystemDefault($$renderer, {});
		} else if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'dark') {
			$$renderer.push('<!--[1-->');
			Moon($$renderer, {});
		} else if ($.store_get($$store_subs ??= {}, '$darkMode', darkMode) === 'light') {
			$$renderer.push('<!--[2-->');
			Sun($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}