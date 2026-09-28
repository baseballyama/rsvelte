import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal, BitsConfig } from "bits-ui";

var root = $.from_html(`<div class="size-12 bg-blue-600"></div>`);
var root_1 = $.from_html(`<div class="bg-background flex rounded-md border p-2"><section class="flex size-12 items-center justify-center bg-blue-200"><div class="size-8 bg-blue-400"></div> <!></section></div>`);

export default function Portal_demo($$anchor) {
	let target = $.state(void 0);

	BitsConfig($$anchor, {
		get defaultPortalTo() {
			return $.get(target);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var section = $.child(div);
			var node = $.sibling($.child(section), 2);

			Portal(node, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(section);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(target, $$value), () => $.get(target));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}