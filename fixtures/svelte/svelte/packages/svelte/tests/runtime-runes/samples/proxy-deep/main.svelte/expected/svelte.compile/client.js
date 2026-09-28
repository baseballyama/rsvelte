import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button>double</button>`, 1);

export default function Main($$anchor) {
	const object = $.proxy({ foo: { bar: { baz: 1 } } });
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, object.foo.bar.baz));
	$.delegated('click', button, () => object.foo.bar.baz += 1);
	$.delegated('click', button_1, () => object.foo.bar = { baz: object.foo.bar.baz * 2 });
	$.append($$anchor, fragment);
}

$.delegate(['click']);