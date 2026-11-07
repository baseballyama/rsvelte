import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { mergeProps } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'child',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<time><!></time>`);

export default function Timeline_date($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => mergeProps(restProps, {
		class: cn('text-muted-foreground mb-1 block text-xs font-medium max-sm:group-data-[orientation=vertical]/timeline:h-4', $$props.class),
		'data-slot': 'timeline-date'
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var time = root();

			$.attribute_effect(time, () => ({ ...$.get(mergedProps) }));

			var node_2 = $.child(time);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(time);
			$.append($$anchor, time);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}