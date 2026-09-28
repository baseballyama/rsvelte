import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	const alerts = ['Alert1', 'Alert2'];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => alerts, $.index, ($$anchor, alert) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(alert)));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}