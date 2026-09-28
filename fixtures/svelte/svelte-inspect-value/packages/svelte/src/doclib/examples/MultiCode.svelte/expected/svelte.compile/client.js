import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import Code from '../Code.svelte';

var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<div class="examples"><div class="tabs svelte-1gkbb0f"></div> <!></div>`);

export default function MultiCode($$anchor, $$props) {
	$.push($$props, true);

	// svelte-ignore state_referenced_locally
	let currentLabel = $.state($.proxy($$props.examples[0].label));

	let currentExample = $.derived(() => $$props.examples.find((ex) => ex.label === $.get(currentLabel)));

	setContext('multi', true);

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $$props.examples, ({ label }) => label, ($$anchor, $$item) => {
		let label = () => $.get($$item).label;
		var button = root();
		let classes;
		var text = $.only_child(button, true);

		$.template_effect(() => {
			classes = $.set_class(button, 1, 'svelte-1gkbb0f', null, classes, { active: $.get(currentLabel) === label() });
			$.set_text(text, label());
		});

		$.delegated('click', button, () => $.set(currentLabel, label(), true));
		$.append($$anchor, button);
	});

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			Code($$anchor, $.spread_props(() => $.get(currentExample)));
		};

		$.if(node, ($$render) => {
			if ($.get(currentExample)) $$render(consequent);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);