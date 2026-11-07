import * as $ from 'svelte/internal/server';
import { Tag, TagSet } from "carbon-components-svelte";

export default function TagSetDismissible($$renderer) {
	let tags = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" }
	];

	function handleTagClose({ detail }) {
		tags = tags.filter((_, index) => index !== detail.index);
	}

	TagSet($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(tags);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tag = each_array[$$index];

				Tag($$renderer, {
					type: tag.type,
					filter: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(tag.label)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}