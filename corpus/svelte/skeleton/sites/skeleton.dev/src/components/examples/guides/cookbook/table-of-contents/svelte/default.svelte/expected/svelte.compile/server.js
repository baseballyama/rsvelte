import * as $ from 'svelte/internal/server';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** The text value within the heading tag; stripped of HTML. */
		/** A generated slug value based on the text. */
		/** Depth indicates headings H1-H6. */
		/** The generated list of page headings, slugs, and depth. */
		const headings = [
			{
				text: 'Real World Example',
				slug: 'real-world-example',
				depth: 1
			},
			{ text: 'Semantic Markup', slug: 'semantic-markup', depth: 1 },
			{ text: 'Utilities', slug: 'utilities', depth: 1 },
			{ text: 'Grid', slug: 'grid', depth: 2 },
			{ text: 'Alignment', slug: 'alignment', depth: 2 },
			{
				text: 'Responsive Design',
				slug: 'responsive-design',
				depth: 2
			},
			{ text: 'In Conclusion', slug: 'in-conclusion', depth: 1 }
		];

		/** Provide a padding-left class based on the depth. */
		function setIndentationClass(depth) {
			return ({
				0: 'pl-0',
				1: 'pl-2',
				2: 'pl-4',
				3: 'pl-6',
				4: 'pl-8',
				5: 'pl-10'
			})[depth] ?? 'pl-0';
		}

		$$renderer.push(`<nav class="card bg-surface-100-900 p-4"><div class="text-sm space-y-2"><div class="font-bold">On This Page</div> <ul class="space-y-2"><li><a${$.attr('href', `#_top`)} class="anchor block">Overview</a></li> <!--[-->`);

		const each_array = $.ensure_array_like(headings);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let heading = each_array[$$index];

			$$renderer.push(`<li><a${$.attr('href', `#${heading.slug}`)}${$.attr_class(`anchor block ${$.stringify(setIndentationClass(heading.depth))}`)}>${$.escape(heading.text)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></nav>`);
	});
}