import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img alt="Svelte" src="foo.png"/>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state('lazy');

	$.user_effect(() => {
		$.set(loading, 'eager');
	});

	var img = root();

	$.template_effect(() => $.set_attribute(img, 'loading', $.get(loading)));
	$.append($$anchor, img);
	$.pop();
}