import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Input, Label } from "@svecodocs/kit";
import { ScrollState } from "runed";
import { preventDefault } from "svelte/legacy";

var root = $.from_html(`<div class="flex items-baseline gap-2"><span class="text-sm font-medium leading-none"> </span> <span> </span></div>`);
var root_1 = $.from_html(`<span>Smooth Scroll</span> <input type="checkbox"/>`, 1);
var root_2 = $.from_html(`<div class=" dark:bg-primary bg-background dark:ring-primary-hover dark:inset-shadow-muted/20 dark:inset-ring-muted/10 inset-ring-muted/20 ring-muted inset-shadow-muted/20 inset-ring inset-shadow-sm relative mb-4 mt-6 max-w-[760px] overflow-hidden rounded-xl ring"><div class="bg-background border-border absolute left-0 top-0 h-4 w-full border-b"><div class="relative w-full"><div class="h-4 bg-[#F64A00]"></div></div></div> <div class="bg-background border-border absolute left-0 top-0 h-full w-4 border-b"><div class="relative h-full"><div class="w-4 bg-[#F64A00]"></div></div></div> <div class="h-[800px] overflow-scroll"><div class="pattern size-[1200px] svelte-1qb8zdd"></div></div> <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold">Scroll me</div> <div class="bg-muted absolute inset-4 !top-[unset] rounded-lg p-4"><h2 class="font-bold">Controls & State</h2> <div class="mt-2 flex items-center gap-2"><form class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><!> <!></div></form> <form class="flex flex-col gap-2"><!> <div class="flex items-center gap-2"><!> <!></div></form></div> <div class="mt-4 grid grid-cols-5 items-center gap-4"><!> <!></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Progress</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4"><div class="flex place-items-center gap-2"><span class="text-sm font-medium leading-none">x</span> <span class="text-xs text-white"> </span></div> <div class="flex place-items-center gap-2"><span class="text-sm font-medium leading-none">y</span> <span class="text-xs text-white"> </span></div></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Arrived</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4"><!> <!> <!> <!></div> <hr class="border-foreground/10 mt-2 h-px border"/> <h3 class="mt-2 text-sm font-semibold">Directions</h3> <div class="mt-2 grid grid-cols-5 items-center gap-4"><!> <!> <!> <!></div></div></div>`);

export default function Scroll_state($$anchor, $$props) {
	$.push($$props, true);

	let el = $.state(void 0);
	let behavior = $.state("smooth");

	const scroll = new ScrollState({
		element: () => $.get(el),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- for some reason ScrollBehavior is not defined
		behavior: () => $.get(behavior)
	});

	let x = $.derived(() => scroll.x);
	let y = $.derived(() => scroll.y);
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.only_child(div_2);

	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var div_6 = $.only_child(div_5);

	$.reset(div_4);

	var div_7 = $.sibling(div_4, 2);

	$.bind_this(div_7, ($$value) => $.set(el, $$value), () => $.get(el));

	var div_8 = $.sibling(div_7, 4);

	{
		const info = ($$anchor, label = $.noop, condition = $.noop) => {
			var div_9 = root();
			var span = $.child(div_9);
			var text = $.only_child(span, true);
			var span_1 = $.sibling(span, 2);
			var text_1 = $.only_child(span_1, true);

			$.reset(div_9);

			$.template_effect(() => {
				$.set_text(text, label());

				$.set_class(span_1, 1, $.clsx([
					"rounded-lg px-1.5 py-0.5  text-xs text-white ",
					condition() ? "bg-emerald-700" : "bg-red-900"
				]));

				$.set_text(text_1, condition() ? "Yes" : "No");
			});

			$.append($$anchor, div_9);
		};

		var div_10 = $.sibling($.child(div_8), 2);
		var form = $.child(div_10);
		var event_handler = $.derived(() => preventDefault(() => scroll.x = $.get(x)));
		var node = $.child(form);

		Label(node, {
			for: 'x',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('X Position');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		var div_11 = $.sibling(node, 2);
		var node_1 = $.child(div_11);

		Input(node_1, {
			type: 'number',
			id: 'x',
			get value() {
				return $.get(x);
			},

			set value($$value) {
				$.set(x, $$value);
			}
		});

		var node_2 = $.sibling(node_1, 2);

		{
			let $0 = $.derived(() => $.get(x) === scroll.x);

			Button(node_2, {
				get disabled() {
					return $.get($0);
				},
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Set');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_11);
		$.reset(form);

		var form_1 = $.sibling(form, 2);
		var event_handler_1 = $.derived(() => preventDefault(() => scroll.y = $.get(y)));
		var node_3 = $.child(form_1);

		Label(node_3, {
			for: 'x',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Y Position');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});

		var div_12 = $.sibling(node_3, 2);
		var node_4 = $.child(div_12);

		Input(node_4, {
			type: 'number',
			id: 'y',
			get value() {
				return $.get(y);
			},

			set value($$value) {
				$.set(y, $$value);
			}
		});

		var node_5 = $.sibling(node_4, 2);

		{
			let $0 = $.derived(() => $.get(y) === scroll.y);

			Button(node_5, {
				get disabled() {
					return $.get($0);
				},
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Set');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_12);
		$.reset(form_1);
		$.reset(div_10);

		var div_13 = $.sibling(div_10, 2);
		var node_6 = $.child(div_13);

		Label(node_6, {
			class: 'flex items-center gap-2',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var input = $.sibling($.first_child(fragment), 2);

				$.remove_input_defaults(input);
				$.bind_checked(input, () => $.get(behavior) === "smooth", (c) => $.set(behavior, c ? "smooth" : "instant", true));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});

		var node_7 = $.sibling(node_6, 2);

		info(node_7, () => "isScrolling", () => scroll.isScrolling);
		$.reset(div_13);

		var div_14 = $.sibling(div_13, 6);
		var div_15 = $.child(div_14);
		var span_2 = $.sibling($.child(div_15), 2);
		var text_6 = $.only_child(span_2);

		$.reset(div_15);

		var div_16 = $.sibling(div_15, 2);
		var span_3 = $.sibling($.child(div_16), 2);
		var text_7 = $.only_child(span_3);

		$.reset(div_16);
		$.reset(div_14);

		var div_17 = $.sibling(div_14, 6);
		var node_8 = $.child(div_17);

		info(node_8, () => "top", () => scroll.arrived.top);

		var node_9 = $.sibling(node_8, 2);

		info(node_9, () => "right", () => scroll.arrived.right);

		var node_10 = $.sibling(node_9, 2);

		info(node_10, () => "bottom", () => scroll.arrived.bottom);

		var node_11 = $.sibling(node_10, 2);

		info(node_11, () => "left", () => scroll.arrived.left);
		$.reset(div_17);

		var div_18 = $.sibling(div_17, 6);
		var node_12 = $.child(div_18);

		info(node_12, () => "top", () => scroll.directions.top);

		var node_13 = $.sibling(node_12, 2);

		info(node_13, () => "right", () => scroll.directions.right);

		var node_14 = $.sibling(node_13, 2);

		info(node_14, () => "bottom", () => scroll.directions.bottom);

		var node_15 = $.sibling(node_14, 2);

		info(node_15, () => "left", () => scroll.directions.left);
		$.reset(div_18);
		$.reset(div_8);

		$.template_effect(
			($0, $1) => {
				$.set_text(text_6, `${$0 ?? ''}%`);
				$.set_text(text_7, `${$1 ?? ''}%`);
			},
			[
				() => scroll.progress.x.toFixed(0),
				() => scroll.progress.y.toFixed(0)
			]
		);

		$.event('submit', form, function (...$$args) {
			$.get(event_handler)?.apply(this, $$args);
		});

		$.event('submit', form_1, function (...$$args) {
			$.get(event_handler_1)?.apply(this, $$args);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_style(div_3, `width: ${scroll.progress.y ?? ''}%;`);
			$.set_style(div_6, `height: ${scroll.progress.x ?? ''}%;`);
		},
		[
			() => scroll.progress.x.toFixed(0),
			() => scroll.progress.y.toFixed(0)
		]
	);

	$.append($$anchor, div);
	$.pop();
}