import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';
import { tooltip } from '$lib/actions/tooltip.js';

var root = $.from_html(`<button><h5> </h5> <p> </p></button>`);
var root_1 = $.from_html(`<div class="card examples-card"><details class="examples-details"><summary class="examples-summary"><!> <h4> </h4></summary> <div class="examples-grid"></div></details></div>`);

export default function ExamplesCard($$anchor, $$props) {
	$.push($$props, true);

	let selectedIndex = $.prop($$props, 'selectedIndex', 3, null),
		title = $.prop($$props, 'title', 3, 'Quick Examples');

	var div = root_1();
	var details = $.child(div);
	var summary = $.child(details);
	var node = $.child(summary);

	Icon(node, { name: 'chevron-right', size: 'xs' });

	var h4 = $.sibling(node, 2);
	var text = $.only_child(h4, true);

	$.reset(summary);

	var div_1 = $.sibling(summary, 2);

	$.each(div_1, 21, () => $$props.examples, $.index, ($$anchor, example, i) => {
		var button = root();
		let classes;
		var h5 = $.child(button);
		var text_1 = $.only_child(h5, true);
		var p = $.sibling(h5, 2);
		var text_2 = $.only_child(p, true);

		$.reset(button);

		$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => $$props.getTooltip
			? $$props.getTooltip($.get(example))
			: $$props.getDescription($.get(example)));

		$.template_effect(
			($0, $1) => {
				classes = $.set_class(button, 1, 'example-card', null, classes, { selected: selectedIndex() === i });
				$.set_text(text_1, $0);
				$.set_text(text_2, $1);
			},
			[
				() => $$props.getLabel($.get(example)),
				() => $$props.getDescription($.get(example))
			]
		);

		$.delegated('click', button, () => $$props.onSelect($.get(example), i));
		$.append($$anchor, button);
	});

	$.reset(div_1);
	$.reset(details);
	$.reset(div);
	$.template_effect(() => $.set_text(text, title()));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);