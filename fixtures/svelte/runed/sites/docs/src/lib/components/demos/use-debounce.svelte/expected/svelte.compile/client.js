import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useDebounce } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<div class="flex flex-col gap-2.5"><!> <!></div> <div class="flex items-center gap-4"><!> <!> <!></div> <p class="mt-2"> </p>`, 1);

export default function Use_debounce($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let logged = $.state("");
	let isFirstTime = $.state(true);
	let durationMs = $.state(1000);

	const logCount = useDebounce(
		() => {
			if ($.get(isFirstTime)) {
				$.set(isFirstTime, false);
				$.set(logged, `You pressed the button ${$.get(count)} times!`);
			} else {
				$.set(logged, `You pressed the button ${$.get(count)} times since last time!`);
			}

			$.set(count, 0);
		},
		() => $.get(durationMs)
	);

	function ding() {
		$.update(count);
		logCount();
	}

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Label(node, {
				for: 'duration',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Debounce duration (ms)');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
				id: 'duration',
				type: 'number',
				get value() {
					return $.get(durationMs);
				},

				set value($$value) {
					$.set(durationMs, $$value, true);
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			Button(node_2, {
				variant: 'brand',
				size: 'sm',
				onclick: ding,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('DING DING DING');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => !logCount.pending);

				Button(node_3, {
					variant: 'ghost',
					size: 'sm',
					get onclick() {
						return logCount.runScheduledNow;
					},

					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Run now');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				let $0 = $.derived(() => !logCount.pending);

				Button(node_4, {
					variant: 'ghost',
					size: 'sm',
					get onclick() {
						return logCount.cancel;
					},

					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Cancel message');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_1);

			var p = $.sibling(div_1, 2);
			var text_4 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_4, $.get(logged) || "Press the button!"));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}