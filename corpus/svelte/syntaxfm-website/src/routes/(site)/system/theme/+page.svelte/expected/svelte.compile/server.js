import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';
import ShowCard from '$lib/ShowCard.svelte';
import { theme_maker } from '$state/theme';
import { onMount } from 'svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const { show } = data;

		onMount(() => {
			theme_maker.open();
		});

		afterNavigate(() => {
			theme_maker.open();
		});

		$$renderer.push(`<div class="zone"><h3>Normal Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"${$.attr_style('', { '--bg': 'var(--fg-sheet)', '--fg': 'var(--bg-sheet)' })}><h3>Inverse Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"${$.attr_style('', { '--bg': 'var(--bg-root)', '--fg': 'var(--fg-root)' })}><h3>Always Dark Zone</h3> <p>By default zones don't have any padding, but they do enable easy setting of local --bg and --fg
		variables.</p></div> <div class="zone"${$.attr_style('border: solid 0.5px var(--black-1)', { '--radius': '20px', '--bg': 'var(--bg-1)' })}><h3>Zone With Accent</h3> <p>A zone with accents is just a zone with custom style, --bg, --radius, --border values. This
		utilizes the --bg-1 variable to control accents in themes.</p></div> `);

		if (show?.id) {
			$$renderer.push(`<!--[0--><h3>Grid With Cards</h3> <div class="grid">`);
			ShowCard($$renderer, { display: 'highlight', show });
			$$renderer.push(`<!----> `);
			ShowCard($$renderer, { show });
			$$renderer.push(`<!---->`);
			ShowCard($$renderer, { show });
			$$renderer.push(`<!---->`);
			ShowCard($$renderer, { show });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}