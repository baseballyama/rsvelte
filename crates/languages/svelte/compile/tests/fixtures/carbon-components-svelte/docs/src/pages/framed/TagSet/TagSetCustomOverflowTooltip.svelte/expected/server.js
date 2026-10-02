import * as $ from 'svelte/internal/server';
import { Tag, TagSet } from "carbon-components-svelte";

export default function TagSetCustomOverflowTooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const frameworks = [
			{ label: "Angular", type: "red" },
			{ label: "React", type: "blue" },
			{ label: "Svelte", type: "purple" },
			{ label: "Vue", type: "green" },
			{ label: "Ember", type: "magenta" },
			{ label: "Preact", type: "cyan" }
		];

		$$renderer.push(`<div style="max-width: 12rem;">`);

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

			$$slots: {
				default: true,
				overflowTooltip: ($$renderer, { tags, count }) => {
					{
						$$renderer.push(`<strong>${$.escape(count)} more:</strong> ${$.escape(tags.map((tag) => tag.label).join(", "))}`);
					}
				}
			}
		});

		$$renderer.push(`<!----></div>`);
	});
}