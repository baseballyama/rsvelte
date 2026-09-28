import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TimeSegment from './time-segment.svelte';
import { cn } from '$lib/utils';
import { TimeField } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'unstyled']);

export default function Time_input($$anchor, $$props) {
	$.push($$props, true);

	let unstyled = $.prop($$props, 'unstyled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let segments = () => ($$arg0?.()).segments;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 19, segments, (segment, i) => segment.part + i, ($$anchor, segment) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						TimeSegment($$anchor, {
							get segment() {
								return $.get(segment);
							}
						});
					};

					$.if(node_2, ($$render) => {
						if ($.get(segment).part !== 'dayPeriod') $$render(consequent);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn(!unstyled() && 'border-input bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:has-aria-invalid:ring-destructive/20 dark:focus-within:has-aria-invalid:ring-destructive/40 focus-within:has-aria-invalid:border-destructive relative inline-flex h-9 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-[3px]', $$props.class));

		$.component(node, () => TimeField.Input, ($$anchor, TimeField_Input) => {
			TimeField_Input($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},
				children,
				$$slots: { default: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}