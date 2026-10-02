import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useInterval } from "runed";
import { Input, Label, Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<div class="flex flex-col gap-2.5"><!> <!></div> <div class="flex items-center gap-4"><!> <!> <!></div> <div class="flex flex-col gap-2"><p><strong>Counter:</strong> </p> <p><strong>Status:</strong> </p></div>`, 1);

export default function Use_interval($$anchor, $$props) {
	$.push($$props, true);

	let intervalMs = $.state(500);
	const interval = useInterval(() => $.get(intervalMs));

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Label(node, {
				for: 'interval',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Interval duration (ms)');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
				id: 'interval',
				type: 'number',
				min: '100',
				step: '100',
				get value() {
					return $.get(intervalMs);
				},

				set value($$value) {
					$.set(intervalMs, $$value, true);
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			{
				let $0 = $.derived(() => !interval.isActive);

				Button(node_2, {
					variant: 'brand',
					size: 'sm',
					get onclick() {
						return interval.pause;
					},

					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Pause');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				variant: 'brand',
				size: 'sm',
				get onclick() {
					return interval.resume;
				},

				get disabled() {
					return interval.isActive;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Resume');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				variant: 'ghost',
				size: 'sm',
				get onclick() {
					return interval.reset;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Reset Counter');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var p = $.child(div_2);
			var text_4 = $.sibling($.child(p));

			$.reset(p);

			var p_1 = $.sibling(p, 2);
			var text_5 = $.sibling($.child(p_1));

			$.reset(p_1);
			$.reset(div_2);

			$.template_effect(() => {
				$.set_text(text_4, ` ${interval.counter ?? ''}`);
				$.set_text(text_5, ` ${interval.isActive ? "Running" : "Paused"}`);
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}