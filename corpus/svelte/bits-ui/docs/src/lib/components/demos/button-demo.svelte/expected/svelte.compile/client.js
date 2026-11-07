import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "bits-ui";

export default function Button_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Button.Root, ($$anchor, Button_Root) => {
		Button_Root($$anchor, {
			class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex\n	h-12 items-center justify-center px-[21px] text-[15px]\n	font-semibold active:scale-[0.98] active:transition-all',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Unlimited');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}