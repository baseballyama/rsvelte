import * as $ from 'svelte/internal/server';
import Combinator from "../utils/icons/Combinator.svelte";
import Dev from "../utils/icons/Dev.svelte";
import Hunt from "../utils/icons/Hunt.svelte";
import Reddit from "../utils/icons/Reddit.svelte";
import YouTubeFull from "../utils/icons/YouTubeFull.svelte";
import Section from "./utils/Section.svelte";

export default function Featured($$renderer) {
	const features = {
		"#reddit": Reddit,
		"#dev": Dev,
		"#hunt": Hunt,
		"#combinator": Combinator,
		"#youtube": YouTubeFull
	};

	Section($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-2"><div class="mx-auto mb-4 text-base tracking-tight lg:hidden">Featured in:</div> <div class="flex flex-wrap items-center justify-center gap-8 lg:hidden"><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(features));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [_href, Comp] = each_array[$$index];

				if (Comp) {
					$$renderer.push('<!--[-->');
					Comp($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--></div> <div class="hidden flex-wrap items-center justify-center gap-8 self-stretch py-2 lg:flex"><div class="text-base tracking-tight">Featured in:</div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(Object.entries(features));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let [_href, Comp] = each_array_1[$$index_1];

				if (Comp) {
					$$renderer.push('<!--[-->');
					Comp($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--></div></div>`);
		},
		$$slots: { default: true }
	});
}