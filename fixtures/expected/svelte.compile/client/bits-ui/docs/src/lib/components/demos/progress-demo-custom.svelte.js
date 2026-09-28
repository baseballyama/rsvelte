import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress, useId } from "bits-ui";
import DemoContainer from "../demo-container.svelte";

var root = $.from_html(`<div class="bg-foreground shadow-mini-inset h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out"></div>`);
var root_1 = $.from_html(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span> </span> <span> </span></div> <!></div>`);

export default function Progress_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	let max = $.prop($$props, 'max', 3, 100),
		value = $.prop($$props, 'value', 3, 0),
		min = $.prop($$props, 'min', 3, 0);

	const labelId = useId();

	DemoContainer($$anchor, {
		size: 'xs',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.child(div);
			var span = $.child(div_1);
			var text = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_1);

			var node = $.sibling(div_1, 2);

			$.component(node, () => Progress.Root, ($$anchor, Progress_Root) => {
				Progress_Root($$anchor, {
					get 'aria-labelledby'() {
						return labelId;
					},

					get 'aria-valuetext'() {
						return $$props.valueLabel;
					},

					get value() {
						return value();
					},

					get min() {
						return min();
					},

					get max() {
						return max();
					},
					class: 'bg-dark-10 shadow-mini-inset relative h-[15px] overflow-hidden rounded-full',
					children: ($$anchor, $$slotProps) => {
						var div_2 = root();

						$.template_effect(() => $.set_style(div_2, `transform: translateX(-${100 - 100 * (value() ?? 0) / max()}%)`));
						$.append($$anchor, div_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(span, 'id', labelId);
				$.set_text(text, $$props.label);
				$.set_text(text_1, $$props.valueLabel);
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}