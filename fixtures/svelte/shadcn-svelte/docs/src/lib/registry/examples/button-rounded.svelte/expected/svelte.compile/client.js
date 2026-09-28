import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-col gap-8"><!></div>`);

export default function Button_rounded($$anchor) {
	var div = root();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		size: 'icon',
		class: 'rounded-full',
		children: ($$anchor, $$slotProps) => {
			ArrowUpIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}