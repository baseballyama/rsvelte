import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Progress } from "bits-ui";
import { onMount } from "svelte";
import { cubicInOut } from "svelte/easing";
import { Tween } from "svelte/motion";

var root = $.from_html(`<div class="bg-foreground shadow-mini-inset h-full w-full flex-1 rounded-full"></div>`);
var root_1 = $.from_html(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span>Uploading file...</span> <span> </span></div> <!></div>`);

export default function Progress_demo($$anchor, $$props) {
	const labelId = $.props_id();

	$.push($$props, true);

	const tween = new Tween(13, { duration: 1000, easing: cubicInOut });

	onMount(() => {
		const timer = setTimeout(() => tween.set(66), 500);

		return () => {
			clearTimeout(timer);
		};
	});

	var div = root_1();
	var div_1 = $.child(div);
	var span = $.child(div_1);
	var span_1 = $.sibling(span, 2);
	var text = $.only_child(span_1);

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		let $0 = $.derived(() => Math.round(tween.current));

		$.component(node, () => Progress.Root, ($$anchor, Progress_Root) => {
			Progress_Root($$anchor, {
				get 'aria-labelledby'() {
					return labelId;
				},

				get value() {
					return $.get($0);
				},
				max: 100,
				class: 'bg-dark-10 shadow-mini-inset relative h-[15px] w-full overflow-hidden rounded-full',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root();

					$.template_effect(() => $.set_style(div_2, `transform: translateX(-${100 - 100 * (tween.current ?? 0) / 100}%)`));
					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(span, 'id', labelId);
			$.set_text(text, `${$0 ?? ''}%`);
		},
		[() => Math.round(tween.current)]
	);

	$.append($$anchor, div);
	$.pop();
}