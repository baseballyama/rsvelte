import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Datepicker, P, Button } from "flowbite-svelte";

var root = $.from_html(`<div class="mt-2 flex gap-2"><!> <!> <!></div>`);

var root_1 = $.from_html(
	`<div class="mb-64 md:w-1/2"><!> <!> <!></div> Lorem ipsum dolor sit amet consectetur adipisicing elit. In quidem rerum, optio adipisci illum at earum fugiat eius minus quae! Quisquam cumque architecto facilis? Tempora ipsum perferendis quo
explicabo minus.`,
	1
);

export default function ActionSlot($$anchor) {
	let selectedDate = $.state(undefined);
	let lastAction = void 0;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const actionSlot = ($$anchor, $$arg0) => {
			let selectedDate = () => ($$arg0?.()).selectedDate;
			let handleClear = () => ($$arg0?.()).handleClear;
			let handleApply = () => ($$arg0?.()).handleApply;
			var div_1 = root();
			var node_1 = $.child(div_1);

			Button(node_1, {
				size: 'sm',
				get onclick() {
					return handleClear();
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Clear');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => !selectedDate());

				Button(node_2, {
					size: 'sm',
					onclick: () => selectedDate() && handleApply()(selectedDate()),
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Apply');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				size: 'sm',
				onclick: () => console.log("Selection:", selectedDate() || "None"),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Show Selection');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		Datepicker(node, {
			autohide: false,
			get value() {
				return $.get(selectedDate);
			},

			set value($$value) {
				$.set(selectedDate, $$value, true);
			},
			actionSlot,
			$$slots: { actionSlot: true }
		});
	}

	var node_4 = $.sibling(node, 2);

	P(node_4, {
		class: 'mt-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text();

			$.template_effect(($0) => $.set_text(text_3, `Selected date: ${$0 ?? ''}`), [
				() => $.get(selectedDate) ? $.get(selectedDate).toLocaleDateString() : "None"
			]);

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	P(node_5, {
		class: 'mt-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text();

			text_4.nodeValue = 'Last action: ';
			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.next();
	$.append($$anchor, fragment);
}