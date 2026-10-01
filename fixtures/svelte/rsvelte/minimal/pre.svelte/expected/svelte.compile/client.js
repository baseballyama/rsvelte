import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<pre> </pre> <pre>

two newlines</pre> <pre><code> </code></pre> <button type="button">more</button>`,
	1
);

export default function Pre($$anchor) {
	let text = $.state('hi');
	var fragment = root();
	var pre = $.first_child(fragment);
	var text_1 = $.only_child(pre);
	var pre_1 = $.sibling(pre, 4);
	var code = $.child(pre_1);
	var text_2 = $.only_child(code);

	$.reset(pre_1);

	var button = $.sibling(pre_1, 2);

	$.template_effect(() => {
		$.set_text(text_1, `
  a
	${$.get(text) ?? ''}
`);

		$.set_text(text_2, `  ${$.get(text) ?? ''}  `);
	});

	$.delegated('click', button, () => $.set(text, $.get(text) + '!'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);