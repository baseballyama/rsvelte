import * as $ from 'svelte/internal/server';
import { Tag, TagSet } from "carbon-components-svelte";

export default function TagSetOverflow($$renderer) {
	const frameworks = [
		{ label: "Angular", type: "red" },
		{ label: "React", type: "blue" },
		{ label: "Svelte", type: "purple" },
		{ label: "Vue", type: "green" },
		{ label: "Ember", type: "magenta" },
		{ label: "Preact", type: "cyan" },
		{ label: "Solid", type: "teal" },
		{ label: "Qwik", type: "cool-gray" },
		{ label: "Lit", type: "warm-gray" },
		{ label: "Alpine", type: "outline" }
	];

	$$renderer.push(`<div style="max-width: 20rem;">`);

	TagSet($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(frameworks);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let framework = each_array[$$index];

				Tag($$renderer, {
					type: framework.type,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(framework.label)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}