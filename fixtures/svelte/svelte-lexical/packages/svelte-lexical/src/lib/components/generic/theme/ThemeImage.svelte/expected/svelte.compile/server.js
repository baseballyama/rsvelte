import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { themeTracker } from './themeTracker.svelte.js';

export default function ThemeImage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { lightSrc, darkSrc, alt, class: className = '', style = '' } = $$props;

		let src = $.derived(() => {
			if (themeTracker.color === 'dark') {
				return darkSrc;
			} else {
				return lightSrc;
			}
		});

		// Update source on client-side initialization
		onMount(() => {
			src('' // this is required to avoid: hydration_attribute_changed (The client value will be ignored in favour of the server value)
			);

			if (themeTracker.color === 'dark') {
				src(darkSrc);
			} else {
				src(lightSrc);
			}
		});

		$$renderer.push(`<img${$.attr('src', src())}${$.attr('alt', alt)}${$.attr_class($.clsx(className))}${$.attr_style(style)}/>`);
	});
}