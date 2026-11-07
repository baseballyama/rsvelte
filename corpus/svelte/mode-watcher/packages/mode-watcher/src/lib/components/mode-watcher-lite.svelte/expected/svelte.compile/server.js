import * as $ from 'svelte/internal/server';

export default function Mode_watcher_lite($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { themeColors } = $$props;

		if (themeColors) {
			$$renderer.push(`<!--[0--><meta name="theme-color"${$.attr('content', themeColors.dark)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}