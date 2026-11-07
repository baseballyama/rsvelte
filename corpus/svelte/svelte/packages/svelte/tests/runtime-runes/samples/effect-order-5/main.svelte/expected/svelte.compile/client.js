import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	$.user_pre_effect(() => {
		$.user_effect(() => {
			console.log('effect 1');
		});
	});

	function template() {
		$.user_effect(() => {
			console.log('effect 2');
		});
	}

	$.next();

	var text = $.text();

	$.template_effect(($0) => $.set_text(text, $0), [() => template()]);
	$.append($$anchor, text);
	$.pop();
}