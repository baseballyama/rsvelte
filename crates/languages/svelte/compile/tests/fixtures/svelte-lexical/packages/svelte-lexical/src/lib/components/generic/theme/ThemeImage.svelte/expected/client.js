import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { themeTracker } from './themeTracker.svelte.js';

var root = $.from_html(`<img/>`);

export default function ThemeImage($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, '');

	let src = $.derived(() => {
		if (themeTracker.color === 'dark') {
			return $$props.darkSrc;
		} else {
			return $$props.lightSrc;
		}
	});

	// Update source on client-side initialization
	onMount(() => {
		$.set(src, '' // this is required to avoid: hydration_attribute_changed (The client value will be ignored in favour of the server value)
		);

		if (themeTracker.color === 'dark') {
			$.set(src, $$props.darkSrc);
		} else {
			$.set(src, $$props.lightSrc);
		}
	});

	var img = root();

	$.template_effect(() => {
		$.set_attribute(img, 'src', $.get(src));
		$.set_attribute(img, 'alt', $$props.alt);
		$.set_class(img, 1, $.clsx(className()));
		$.set_style(img, style());
	});

	$.append($$anchor, img);
	$.pop();
}