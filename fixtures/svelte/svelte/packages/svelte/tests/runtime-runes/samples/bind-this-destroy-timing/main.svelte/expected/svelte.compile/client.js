import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inner from './Inner.svelte';

var root = $.from_html(`<!> <button>clear</button> <p> </p>`, 1);

export default function Main($$anchor) {
	let value = $.state('hello');
	let innerComp = $.state(void 0);

	// Reads Inner's derived value from outside the {#if} block, keeping it
	// connected in the reactive graph even after the branch is destroyed.
	const externalView = $.derived(() => $.get(innerComp)?.getProcessed() ?? '');

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const result = $.derived(() => $.get(value));

			$.bind_this(
				Inner($$anchor, {
					get data() {
						return $.get(result);
					}
				}),
				($$value) => $.set(innerComp, $$value, true),
				() => $.get(innerComp)
			);
		};

		$.if(node, ($$render) => {
			if ($.get(value)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var p = $.sibling(button, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(externalView)));
	$.delegated('click', button, () => $.set(value, undefined));
	$.append($$anchor, fragment);
}

$.delegate(['click']);