import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'hideLabel',
	'indicator',
	'hideIndicator',
	'label',
	'labelClassName',
	'payload'
]);

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<span class="font-mono font-medium text-foreground tabular-nums"> </span>`);
var root_3 = $.from_html(`<div><!> <div><div class="grid gap-1.5"><!> <span class="text-muted-foreground"> </span></div> <!></div></div>`);
var root_4 = $.from_html(`<div><!> <div class="grid gap-1.5"></div></div>`);

export default function Chart_tooltip_demo_item($$anchor, $$props) {
	$.push($$props, true);

	const TooltipLabel = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(
					($0) => {
						$.set_class(div, 1, $0);
						$.set_text(text, $$props.label);
					},
					[() => $.clsx(cn("font-medium", $$props.labelClassName))]
				);

				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if ($$props.label && !hideLabel()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		hideLabel = $.prop($$props, 'hideLabel', 3, false),
		indicator = $.prop($$props, 'indicator', 3, "dot"),
		hideIndicator = $.prop($$props, 'hideIndicator', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const nestLabel = $.derived(() => $$props.payload.length === 1 && indicator() === "dot");
	var div_1 = root_4();

	$.attribute_effect(div_1, ($0) => ({ class: $0, ...restProps }), [
		() => cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", $$props.class)
	]);

	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			TooltipLabel($$anchor);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(nestLabel)) $$render(consequent_1);
		});
	}

	var div_2 = $.sibling(node_1, 2);

	$.each(div_2, 23, () => $$props.payload, (item, i) => item.name + i, ($$anchor, item) => {
		const indicatorColor = $.derived(() => $.get(item).color);
		var div_3 = root_3();
		var node_2 = $.child(div_3);

		{
			var consequent_2 = ($$anchor) => {
				var div_4 = root_1();

				$.template_effect(
					($0) => {
						$.set_style(div_4, `--color-bg: ${$.get(indicatorColor) ?? ''}; --color-border: ${$.get(indicatorColor) ?? ''};`);
						$.set_class(div_4, 1, $0);
					},
					[
						() => $.clsx(cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
							"size-2.5": indicator() === "dot",
							"h-full w-1": indicator() === "line",
							"w-0 border-[1.5px] border-dashed bg-transparent": indicator() === "dashed",
							"my-0.5": $.get(nestLabel) && indicator() === "dashed"
						}))
					]
				);

				$.append($$anchor, div_4);
			};

			$.if(node_2, ($$render) => {
				if (!hideIndicator()) $$render(consequent_2);
			});
		}

		var div_5 = $.sibling(node_2, 2);
		var div_6 = $.child(div_5);
		var node_3 = $.child(div_6);

		{
			var consequent_3 = ($$anchor) => {
				TooltipLabel($$anchor);
			};

			$.if(node_3, ($$render) => {
				if ($.get(nestLabel)) $$render(consequent_3);
			});
		}

		var span = $.sibling(node_3, 2);
		var text_1 = $.only_child(span, true);

		$.reset(div_6);

		var node_4 = $.sibling(div_6, 2);

		{
			var consequent_4 = ($$anchor) => {
				var span_1 = root_2();
				var text_2 = $.only_child(span_1, true);

				$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(item).value.toLocaleString()]);
				$.append($$anchor, span_1);
			};

			$.if(node_4, ($$render) => {
				if ($.get(item).value) $$render(consequent_4);
			});
		}

		$.reset(div_5);
		$.reset(div_3);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_3, 1, $0);
				$.set_class(div_5, 1, $1);
				$.set_text(text_1, $.get(item).name);
			},
			[
				() => $.clsx(cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator() === "dot" && "items-center")),
				() => $.clsx(cn("flex flex-1 justify-between leading-none", $.get(nestLabel) ? "items-end" : "items-center"))
			]
		);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div_1);
	$.pop();
}