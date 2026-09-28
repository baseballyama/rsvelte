import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Combinator from "../utils/icons/Combinator.svelte";
import Dev from "../utils/icons/Dev.svelte";
import Hunt from "../utils/icons/Hunt.svelte";
import Reddit from "../utils/icons/Reddit.svelte";
import YouTubeFull from "../utils/icons/YouTubeFull.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`<div class="flex flex-col gap-2"><div class="mx-auto mb-4 text-base tracking-tight lg:hidden">Featured in:</div> <div class="flex flex-wrap items-center justify-center gap-8 lg:hidden"></div> <div class="hidden flex-wrap items-center justify-center gap-8 self-stretch py-2 lg:flex"><div class="text-base tracking-tight">Featured in:</div> <!></div></div>`);

export default function Featured($$anchor) {
	const features = {
		"#reddit": Reddit,
		"#dev": Dev,
		"#hunt": Hunt,
		"#combinator": Combinator,
		"#youtube": YouTubeFull
	};

	Section($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.sibling($.child(div), 2);

			$.each(div_1, 21, () => Object.entries(features), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let _href = () => $.get($$array)[0];
				let Comp = () => $.get($$array)[1];
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, Comp, ($$anchor, Comp_1) => {
					Comp_1($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_1 = $.sibling($.child(div_2), 2);

			$.each(node_1, 17, () => Object.entries(features), $.index, ($$anchor, $$item) => {
				var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
				let _href = () => $.get($$array_1)[0];
				let Comp = () => $.get($$array_1)[1];
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, Comp, ($$anchor, Comp_2) => {
					Comp_2($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			});

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}