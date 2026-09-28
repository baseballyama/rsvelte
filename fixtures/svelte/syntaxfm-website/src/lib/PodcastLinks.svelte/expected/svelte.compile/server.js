import * as $ from 'svelte/internal/server';
import { PODCAST_LINKS } from '$const';

export default function PodcastLinks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="svelte-cu4gw6"><!--[-->`);

		const each_array = $.ensure_array_like(PODCAST_LINKS);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { text, href } = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', href)} target="_blank"${$.attr_class(`button subscribe subscribe--${$.stringify(text.toLowerCase().replaceAll(' ', '-'))}`, 'svelte-cu4gw6')}>${$.escape(text)}</a>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}