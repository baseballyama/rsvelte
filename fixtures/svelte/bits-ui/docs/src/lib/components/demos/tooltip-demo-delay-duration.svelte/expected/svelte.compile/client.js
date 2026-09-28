import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoContainer from "../demo-container.svelte";
import TooltipDemoCustom from "./tooltip-demo-custom.svelte";

var root = $.from_html(`<div class="flex flex-col items-center gap-3"><!> <pre> </pre></div>`);
var root_1 = $.from_html(`<div class="flex w-full flex-col items-center justify-between gap-4 lg:flex-row"></div>`);

export default function Tooltip_demo_delay_duration($$anchor) {
	const durations = [200, 1000, 2500];

	DemoContainer($$anchor, {
		size: 'sm',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 20, () => durations, (duration) => duration, ($$anchor, duration) => {
				var div_1 = root();
				var node = $.child(div_1);

				TooltipDemoCustom(node, {
					get delayDuration() {
						return duration;
					}
				});

				var pre = $.sibling(node, 2);
				var text = $.only_child(pre);

				$.reset(div_1);
				$.template_effect(() => $.set_text(text, `delayDuration=${duration ?? ''}`));
				$.append($$anchor, div_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}