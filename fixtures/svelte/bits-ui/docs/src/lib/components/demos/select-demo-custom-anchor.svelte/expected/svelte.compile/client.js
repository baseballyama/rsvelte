import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoContainer from "../demo-container.svelte";
import SelectDemoCustom from "./select-demo-custom.svelte";

var root = $.from_html(`<div class="flex items-center gap-6"><div class="rounded-md border p-3">Custom Anchor</div> <!></div>`);

export default function Select_demo_custom_anchor($$anchor) {
	let customAnchor = $.state(null);

	DemoContainer($$anchor, {
		size: 'xs',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);

			$.bind_this(div_1, ($$value) => $.set(customAnchor, $$value), () => $.get(customAnchor));

			var node = $.sibling(div_1, 2);

			{
				let $0 = $.derived(() => ({ customAnchor: $.get(customAnchor) }));

				SelectDemoCustom(node, {
					get contentProps() {
						return $.get($0);
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}