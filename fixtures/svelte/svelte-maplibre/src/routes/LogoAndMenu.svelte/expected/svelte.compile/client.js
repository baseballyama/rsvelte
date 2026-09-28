import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/"><img src="/logos/svelte-maplibre-logo-monochrome-dark.svg" alt="Svelte Maplibre" class="h-10 dark:invert"/></a>`);

export default function LogoAndMenu($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, '');
	var a = root();

	$.template_effect(() => $.set_class(a, 1, $.clsx(className())));
	$.append($$anchor, a);
}