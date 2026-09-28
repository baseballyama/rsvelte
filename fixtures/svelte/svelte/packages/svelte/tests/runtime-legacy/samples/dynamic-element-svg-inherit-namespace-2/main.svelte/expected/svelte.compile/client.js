import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Svg from "./svg.svelte";

export default function Main($$anchor) {
	let tag = "path";

	Svg($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.element(node, () => tag, true, ($$element, $$anchor) => {
				$.attribute_effect($$element, () => ({ d: 'M21 12a9 9 0 1 1-6.219-8.56' }));
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}