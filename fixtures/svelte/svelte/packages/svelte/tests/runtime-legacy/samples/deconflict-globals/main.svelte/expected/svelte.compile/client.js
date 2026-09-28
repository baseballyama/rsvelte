import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor, $$props) {
	const document = 'I hereby declare Svelte the bestest framework.';
	const console = 'nintendo sixty four';
	const Error = 'Woops.';
	const Object = 42;
	const Map = false;
	const everyone = [document, console, Error, Object, Map];
	var fragment = $.comment();

	$.head('11qeu67', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Cute test';
		});
	});

	$.event('click', $.window, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('mouseenter', $.document.body, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	var node = $.first_child(fragment);

	$.each(node, 16, () => everyone, (someone) => someone, ($$anchor, someone) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, someone));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}