import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { useStepperItem } from './stepper.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'class', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Stepper_item($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, uid),
		rest = $.rest_props($$props, rest_excludes);

	const stepperItemState = useStepperItem({ id: id() });
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'stepper-item',
			class: $0,
			...stepperItemState.props,
			...rest
		}),
		[
			() => cn('group/stepper-item relative flex', { 'flex-1': !stepperItemState.isLast }, $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}