import * as $ from 'svelte/internal/server';
import '../../../styles/pages.scss';
import { site } from '$lib/constants/site';
import { legalPages } from '$lib/constants/nav';
import Icon from '$lib/components/global/Icon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1hp9pcg', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Legal | Networking Toolbox</title>`);
			});

			$$renderer.push(`<meta name="description" content="Legal information for Networking Toolbox - privacy policy and license"/> <meta property="og:title"${$.attr('content', `Legal | ${$.stringify(site.title)}`)}/> <meta property="og:description" content="Privacy policy and MIT license information for Networking Toolbox"/> <meta property="og:url"${$.attr('content', `${$.stringify(site.url)}/about/legal`)}/>`);
		});

		$$renderer.push(`<div class="hero svelte-1hp9pcg"><h2 class="svelte-1hp9pcg">Legal Information</h2> <p class="lead svelte-1hp9pcg">Boring (but important) stuff</p></div> <section class="legal-links svelte-1hp9pcg"><!--[-->`);

		const each_array = $.ensure_array_like(legalPages);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let page = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', page.href)} class="legal-card svelte-1hp9pcg"><div class="card-icon svelte-1hp9pcg">`);
			Icon($$renderer, { name: page.icon || 'info', size: 'lg' });
			$$renderer.push(`<!----></div> <div class="card-content svelte-1hp9pcg"><h3 class="svelte-1hp9pcg">${$.escape(page.label)}</h3> <p class="svelte-1hp9pcg">${$.escape(page.description)}</p></div> <div class="card-arrow svelte-1hp9pcg">`);
			Icon($$renderer, { name: 'arrow-right', size: 'sm' });
			$$renderer.push(`<!----></div></a>`);
		}

		$$renderer.push(`<!--]--></section> <section class="summary svelte-1hp9pcg"><h3 class="svelte-1hp9pcg">Summary</h3> <p class="svelte-1hp9pcg">Networking Toolbox is open source software licensed under the MIT License. We respect your privacy and process most
    data locally in your browser. For more details, please review the individual documents above.</p></section>`);
	});
}