import * as $ from 'svelte/internal/server';
import slug from 'speakingurl';

export default function TableOfContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { aiShowNote } = $$props;

		$$renderer.push(`<div class="toc"><ul class="svelte-1mn6y5p"><!--[-->`);

		const each_array = $.ensure_array_like(aiShowNote?.summary || []);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let summary = each_array[$$index];

			$$renderer.push(`<li class="svelte-1mn6y5p"><a${$.attr('href', `#${$.stringify(slug(summary.text))}`)} class="svelte-1mn6y5p"><span class="timestamp fst-900 svelte-1mn6y5p">${$.escape(summary.time)}</span> ${$.escape(summary.text)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div>`);
	});
}