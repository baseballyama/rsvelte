import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DemoContainer } from "@svecodocs/kit";
import { onClickOutside } from "runed";

var root = $.from_html(`<div class="border-foreground relative mb-4 rounded-lg border p-4"><span class="bg-foreground text-background absolute right-0 top-0 select-none rounded-bl-md rounded-tr-md px-2.5 py-1 font-mono text-xs">container</span> <p class="select-none pb-4"> </p> <p class="mb-3 font-mono">Status: <span> </span></p> <div class="flex items-center gap-3"><!> <!> <!></div></div>`);

export default function On_click_outside($$anchor, $$props) {
	$.push($$props, true);

	let containerText = $.state("Has not clicked outside yet.");
	let container = $.state(void 0);
	const clickOutside = onClickOutside(() => $.get(container), () => $.set(containerText, "Clicked outside!"));

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var p = $.sibling($.child(div), 2);
			var text = $.only_child(p, true);
			var p_1 = $.sibling(p, 2);
			var span = $.sibling($.child(p_1));
			var text_1 = $.only_child(span, true);

			$.reset(p_1);

			var div_1 = $.sibling(p_1, 2);
			var node = $.child(div_1);

			Button(node, {
				get disabled() {
					return clickOutside.enabled;
				},
				size: 'sm',
				get onclick() {
					return clickOutside.start;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Start');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => !clickOutside.enabled);

				Button(node_1, {
					get disabled() {
						return $.get($0);
					},
					size: 'sm',
					get onclick() {
						return clickOutside.stop;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Stop');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				size: 'sm',
				onclick: () => $.set(containerText, "Has not clicked outside yet."),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Reset');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(container, $$value), () => $.get(container));

			$.template_effect(() => {
				$.set_text(text, $.get(containerText));
				$.set_class(span, 1, $.clsx(clickOutside.enabled ? "text-green-500" : "text-destructive"));
				$.set_text(text_1, clickOutside.enabled ? "Enabled" : "Disabled");
			});

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}