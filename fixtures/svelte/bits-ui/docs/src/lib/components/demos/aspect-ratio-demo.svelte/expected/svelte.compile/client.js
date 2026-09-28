import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio } from "bits-ui";

var root = $.from_html(`<img src="/abstract.png" alt="an abstract painting" class="h-full w-full rounded-[15px] object-cover"/>`);

export default function Aspect_ratio_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AspectRatio.Root, ($$anchor, AspectRatio_Root) => {
		AspectRatio_Root($$anchor, {
			ratio: 14 / 9,
			class: 'rounded-15px scale-[0.8] bg-transparent',
			children: ($$anchor, $$slotProps) => {
				var img = root();

				$.append($$anchor, img);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}