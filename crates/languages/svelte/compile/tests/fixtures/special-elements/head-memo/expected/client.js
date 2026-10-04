import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>change</button>`);

export default function Head_memo($$anchor) {
	let title = $.state("A");
	function value() {
		return $.get(title);
	}
	var button = root();
	$.head('151bazv', ($$anchor) => {
		$.deferred_template_effect(($0) => {
			$.document.title = $0 ?? '';
		}, [() => value()]);
	});
	$.delegated('click', button, () => $.set(title, "B"));
	$.append($$anchor, button);
}

$.delegate(['click']);
