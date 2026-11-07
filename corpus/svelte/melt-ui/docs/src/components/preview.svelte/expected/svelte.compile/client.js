import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { linear } from "svelte/easing";
import { fade } from "svelte/transition";
import { previewCtx } from "./preview-ctx.svelte";

var root = $.from_html(`<button class="absolute bottom-4 left-4 z-10 cursor-pointer rounded-lg bg-gray-500 px-2 py-1
		text-sm text-white transition hover:bg-gray-700 active:bg-gray-800">Edit props</button>`);

var root_1 = $.from_html(`<input type="checkbox"/>`);
var root_2 = $.from_html(`<option> </option>`);
var root_3 = $.from_html(`<select class="self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900"></select>`);
var root_4 = $.from_html(`<input type="number" class="self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900"/>`);
var root_5 = $.from_html(`<input type="text" class="self-stretch rounded-md px-1 py-0.5 dark:bg-gray-900"/>`);
var root_6 = $.from_html(`<label class="flex w-full flex-col items-start gap-1 text-sm font-medium"> <!></label>`);

var root_7 = $.from_html(`<div class="absolute bottom-2 left-2 top-2 z-50 w-[200px] rounded-xl border border-gray-300 bg-gray-100
		p-3 shadow-xl backdrop-blur-xl dark:border-none dark:bg-gray-800/80 svelte-em1rhw" data-preview=""><div class="flex items-center justify-between"><p class="text-xl font-bold text-black dark:text-white">Props</p> <button class="cursor-pointer rounded-lg bg-gray-500 px-2 py-1 text-sm
				text-white transition hover:bg-gray-600 active:bg-gray-700">Close</button></div> <hr class="mt-2 block h-[2px] rounded-full bg-gray-300/50 dark:bg-gray-600"/> <div class="mt-2 flex flex-col gap-2"></div></div>`);

var root_8 = $.from_html(`<div><div class="w-full min-w-0 overflow-clip p-4"><!></div> <!> <!></div>`);

export default function Preview($$anchor, $$props) {
	$.push($$props, true);

	const { values, schema } = previewCtx.get();
	let open = $.state(false);

	function fix(node, fn) {
		const config = fn(node);

		if (!config.delay) return config;

		const easing = config.easing ?? linear;
		const delay = config.delay;
		const duration = config.duration ?? 0;
		const newDuration = duration + delay;

		const getTimingValues = (t) => {
			const transpired = t * newDuration;
			const withoutDelay = Math.max(0, transpired - delay);
			const actualT = withoutDelay / duration;
			const easedT = easing(actualT);

			return [easedT, 1 - easedT];
		};

		const css = (_t) => {
			const [t, u] = getTimingValues(_t);

			return config.css?.(t, u) ?? "";
		};

		const tick = (_t) => {
			const [t, u] = getTimingValues(_t);

			return config.tick?.(t, u) ?? Promise.resolve();
		};

		return {
			...config,
			delay: 0,
			duration: newDuration,
			css,
			tick,
			easing: linear
		};
	}

	var div = root_8();
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.delegated('click', button, () => $.set(open, !$.get(open)));
			$.transition(1, button, () => fix, () => (el) => fade(el, { delay: 300, duration: 200 }));
			$.transition(2, button, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, button);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(open) && values) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root_7();
			var div_3 = $.child(div_2);
			var button_1 = $.sibling($.child(div_3), 2);

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 4);

			$.each(div_4, 21, () => Object.keys(values ?? {}), $.index, ($$anchor, key) => {
				const control = $.derived(() => schema[$.get(key)]);
				var label = root_6();
				var text = $.child(label);
				var node_4 = $.sibling(text);

				{
					var consequent_1 = ($$anchor) => {
						var input = root_1();

						$.remove_input_defaults(input);
						$.bind_checked(input, () => values[$.get(key)], ($$value) => values[$.get(key)] = $$value);
						$.append($$anchor, input);
					};

					var consequent_2 = ($$anchor) => {
						var select = root_3();

						$.each(select, 21, () => $.get(control).options, $.index, ($$anchor, option) => {
							var option_1 = root_2();
							var text_1 = $.only_child(option_1, true);
							var option_1_value = {};

							$.template_effect(() => {
								$.set_text(text_1, $.get(option));

								if (option_1_value !== (option_1_value = $.get(option))) {
									option_1.value = (option_1.__value = option_1_value) ?? '';
								}
							});

							$.append($$anchor, option_1);
						});

						$.reset(select);
						$.init_select(select);
						$.bind_select_value(select, () => values[$.get(key)], ($$value) => values[$.get(key)] = $$value);
						$.append($$anchor, select);
					};

					var consequent_3 = ($$anchor) => {
						var input_1 = root_4();

						$.remove_input_defaults(input_1);

						$.template_effect(() => {
							$.set_attribute(input_1, 'min', $.get(control).min);
							$.set_attribute(input_1, 'max', $.get(control).max);
						});

						$.bind_value(input_1, () => values[$.get(key)], (v) => {
							// Make sure that inputed values don't go outside the specified min/max values.
							if ($.get(control).min && v < $.get(control).min) {
								values[$.get(key)] = $.get(control).min;
							} else if ($.get(control).max && v > $.get(control).max) {
								values[$.get(key)] = $.get(control).max;
							} else {
								values[$.get(key)] = v;
							}
						});

						$.append($$anchor, input_1);
					};

					var consequent_4 = ($$anchor) => {
						var input_2 = root_5();

						$.remove_input_defaults(input_2);
						$.bind_value(input_2, () => values[$.get(key)], ($$value) => values[$.get(key)] = $$value);
						$.append($$anchor, input_2);
					};

					$.if(node_4, ($$render) => {
						if ($.get(control).type === "boolean") $$render(consequent_1); else if ($.get(control).type === "select") $$render(consequent_2, 1); else if ($.get(control).type === "number") $$render(consequent_3, 2); else if ($.get(control).type === "string") $$render(consequent_4, 3);
					});
				}

				$.reset(label);
				$.template_effect(() => $.set_text(text, `${$.get(control).label ?? ''} `));
				$.append($$anchor, label);
			});

			$.reset(div_4);
			$.reset(div_2);
			$.template_effect(() => $.set_attribute(div_2, 'data-open', $.get(open)));
			$.delegated('click', button_1, () => $.set(open, !$.get(open)));
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if (values) $$render(consequent_5);
		});
	}

	$.reset(div);

	$.template_effect(() => $.set_class(div, 1, `not-content relative grid min-h-[500px] place-items-center overflow-clip rounded-2xl border
	bg-gray-100 dark:border-gray-700 dark:bg-gray-950 ${$$props.class ?? ''}`));

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);