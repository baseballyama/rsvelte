import * as $ from 'svelte/internal/server';

export default function LogoAndMenu($$renderer, $$props) {
	let { class: className = '' } = $$props;

	$$renderer.push(`<a href="/"${$.attr_class($.clsx(className))}><img src="/logos/svelte-maplibre-logo-monochrome-dark.svg" alt="Svelte Maplibre" class="h-10 dark:invert"/></a>`);
}