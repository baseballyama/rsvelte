import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { StateHistory } from "runed";
import { Button, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`<div class="flex items-center gap-4 font-mono"><span class="text-muted-foreground/75"> </span> <span> </span></div>`);
var root_1 = $.from_html(`<p class="mt-0"> </p> <div class="flex items-center gap-2"><!> <!> <span class="px-2">/</span> <!> <!></div> <div class="mt-4"><p class="text-muted-foreground m-0 select-none">History (limited to 10 records for demo)</p> <div class="bg-background-secondary mt-2 rounded-md border px-3 py-2"></div></div>`, 1);

export default function State_history($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	const history = new StateHistory(() => $.get(count), (c) => $.set(count, c, true), { capacity: 10 });

	function format(ts) {
		return new Date(ts).toLocaleString();
	}

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var p = $.first_child(fragment_1);
			var text = $.only_child(p);
			var div = $.sibling(p, 2);
			var node = $.child(div);

			Button(node, {
				size: 'sm',
				variant: 'brand',
				onclick: () => $.update(count),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Increment');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				size: 'sm',
				variant: 'brand',
				onclick: () => $.update(count, -1),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Decrement');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 4);

			{
				let $0 = $.derived(() => !history.canUndo);

				Button(node_2, {
					size: 'sm',
					variant: 'ghost',
					get disabled() {
						return $.get($0);
					},

					get onclick() {
						return history.undo;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Undo');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => !history.canRedo);

				Button(node_3, {
					size: 'sm',
					variant: 'ghost',
					get disabled() {
						return $.get($0);
					},

					get onclick() {
						return history.redo;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Redo');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var div_2 = $.sibling($.child(div_1), 2);

			$.each(div_2, 23, () => history.log.toReversed(), (event, i) => `${event}-${i}`, ($$anchor, event) => {
				var div_3 = root();
				var span = $.child(div_3);
				var text_5 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_6 = $.only_child(span_1, true);

				$.reset(div_3);

				$.template_effect(
					($0) => {
						$.set_text(text_5, $0);
						$.set_text(text_6, `{ value: ${$.get(event).snapshot} }`);
					},
					[() => format($.get(event).timestamp)]
				);

				$.append($$anchor, div_3);
			});

			$.reset(div_2);
			$.reset(div_1);
			$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}