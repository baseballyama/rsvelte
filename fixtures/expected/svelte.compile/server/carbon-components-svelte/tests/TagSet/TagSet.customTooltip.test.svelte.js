import * as $ from 'svelte/internal/server';
import Tag from "carbon-components-svelte/Tag/Tag.svelte";
import TagSet from "carbon-components-svelte/TagSet/TagSet.svelte";

export default function TagSet_customTooltip_test($$renderer) {
	const labels = ["Tag 1", "Tag 2", "Tag 3", "Tag 4"];

	TagSet($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(labels);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let label = each_array[$$index];

				Tag($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(label)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},

		$$slots: {
			default: true,
			overflowTooltip: ($$renderer, { count }) => {
				{
					$$renderer.push(`${$.escape(count)}
    hidden <a href="/all-tags">View all</a>`);
				}
			}
		}
	});
}