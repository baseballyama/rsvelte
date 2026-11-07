import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTimeline } from './timeline-context.svelte';
import { cn } from '$lib/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref',
	'step'
]);

var root = $.from_html(`<div><!></div>`);

export default function Timeline_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const { activeStep } = useTimeline();
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			'data-slot': 'timeline-item',
			'data-completed': $$props.step <= activeStep || undefined,
			...restProps
		}),
		[
			() => cn('group/timeline-item relative flex flex-1 flex-col gap-0.5 group-data-[orientation=horizontal]/timeline:mt-8 not-last:group-data-[orientation=horizontal]/timeline:pe-8 group-data-[orientation=vertical]/timeline:ms-8 not-last:group-data-[orientation=vertical]/timeline:pb-12', '[&:has(+[data-completed="true"])_[data-slot=timeline-separator]]:bg-primary', $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}