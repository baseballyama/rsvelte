import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

var root = $.from_html(`<div role="progressbar"></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><span aria-hidden="true"></span> <span class="text-sm text-muted-foreground"> </span> <span class="text-sm text-muted-foreground tabular-nums"> </span></div>`);
var root_2 = $.from_html(`<p class="mb-4 text-base text-muted-foreground"> <span class="font-semibold text-foreground tabular-nums"> </span> </p> <div class="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"></div> <div class="flex flex-wrap items-center gap-x-8 gap-y-2"><!> <div class="flex items-center gap-2"><span class="size-3 shrink-0 rounded-sm bg-muted" aria-hidden="true"></span> <span class="text-sm text-muted-foreground">Free</span> <span class="text-sm text-muted-foreground tabular-nums"> </span></div></div>`, 1);

export default function Stats_13($$anchor, $$props) {
	$.push($$props, true);

	const defaultSegments = [
		{ label: "Documents", value: 2400, color: "bg-blue-500" },
		{ label: "Photos", value: 1800, color: "bg-emerald-500" },
		{ label: "Videos", value: 3200, color: "bg-amber-500" },
		{ label: "Music", value: 900, color: "bg-purple-500" }
	];

	let title = $.prop($$props, 'title', 3, "Using Storage"),
		used = $.prop($$props, 'used', 3, 8300),
		total = $.prop($$props, 'total', 3, 15),
		usedLabel = $.prop($$props, 'usedLabel', 3, "MB"),
		totalLabel = $.prop($$props, 'totalLabel', 3, "GB"),
		segments = $.prop($$props, 'segments', 3, defaultSegments);

	{
		let $0 = $.derived(() => cn("w-full max-w-4xl shadow-sm", $$props.class));

		Card($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				CardContent($$anchor, {
					class: 'py-0',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var p = $.first_child(fragment_2);
						var text = $.child(p);
						var span = $.sibling(text);
						var text_1 = $.only_child(span);
						var text_2 = $.sibling(span);

						$.reset(p);

						var div = $.sibling(p, 2);

						$.each(div, 21, segments, (segment) => segment.label, ($$anchor, segment) => {
							const percentage = $.derived(() => $.get(segment).value / (total() * 1000) * 100);
							var div_1 = root();

							$.set_attribute(div_1, 'aria-valuemin', 0);

							$.template_effect(
								($0) => {
									$.set_class(div_1, 1, $0);
									$.set_style(div_1, `width: ${$.get(percentage) ?? ''}%`);
									$.set_attribute(div_1, 'aria-label', $.get(segment).label);
									$.set_attribute(div_1, 'aria-valuenow', $.get(segment).value);
									$.set_attribute(div_1, 'aria-valuemax', total() * 1000);
								},
								[() => $.clsx(cn("h-full", $.get(segment).color))]
							);

							$.append($$anchor, div_1);
						});

						$.reset(div);

						var div_2 = $.sibling(div, 2);
						var node = $.child(div_2);

						$.each(node, 17, segments, (segment) => segment.label, ($$anchor, segment) => {
							var div_3 = root_1();
							var span_1 = $.child(div_3);
							var span_2 = $.sibling(span_1, 2);
							var text_3 = $.only_child(span_2, true);
							var span_3 = $.sibling(span_2, 2);
							var text_4 = $.only_child(span_3);

							$.reset(div_3);

							$.template_effect(
								($0, $1) => {
									$.set_class(span_1, 1, $0);
									$.set_text(text_3, $.get(segment).label);

									$.set_text(text_4, `${$1 ?? ''}
						${usedLabel() ?? ''}`);
								},
								[
									() => $.clsx(cn("size-3 shrink-0 rounded", $.get(segment).color)),
									() => Math.round($.get(segment).value)
								]
							);

							$.append($$anchor, div_3);
						});

						var div_4 = $.sibling(node, 2);
						var span_4 = $.sibling($.child(div_4), 4);
						var text_5 = $.only_child(span_4);

						$.reset(div_4);
						$.reset(div_2);

						$.template_effect(
							($0, $1) => {
								$.set_text(text, `${title() ?? ''}  `);

								$.set_text(text_1, `${$0 ?? ''} 
				${usedLabel() ?? ''}`);

								$.set_text(text_2, ` 
			of ${total() ?? ''}
			${totalLabel() ?? ''}`);

								$.set_text(text_5, `${$1 ?? ''}
					${usedLabel() ?? ''}`);
							},
							[
								() => used().toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
								() => Math.round(total() * 1000 - used())
							]
						);

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}