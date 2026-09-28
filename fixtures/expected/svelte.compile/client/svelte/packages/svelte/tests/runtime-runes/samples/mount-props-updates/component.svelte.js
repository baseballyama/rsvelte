import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>update</button> `, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let foo = $.prop($$props, 'foo', 7),
		bar = $.prop($$props, 'bar', 7, 'bar'),
		baz = $.prop($$props, 'baz', 15),
		buz = $.prop($$props, 'buz', 15, 'buz');

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${foo() ?? ''}
${bar() ?? ''}
${baz() ?? ''}
${buz() ?? ''}`));

	$.delegated('click', button, () => {
		foo('1');
		bar('2');
		baz('3');
		buz('4');
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);