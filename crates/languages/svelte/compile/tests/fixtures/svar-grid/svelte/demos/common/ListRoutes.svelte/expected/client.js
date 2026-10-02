import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<code><pre class="svelte-67utvj"><!>
</pre></code>`);

export default function ListRoutes($$anchor, $$props) {
	var code = root();
	var pre = $.child(code);
	var node = $.child(pre);

	$.each(node, 17, () => $$props.routes, $.index, ($$anchor, route) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, `
			${'"' + $.get(route) + '",\n'}
		`));

		$.append($$anchor, text);
	});

	$.next();
	$.reset(pre);
	$.reset(code);
	$.append($$anchor, code);
}