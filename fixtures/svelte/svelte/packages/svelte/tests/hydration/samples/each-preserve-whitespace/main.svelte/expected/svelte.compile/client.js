import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`
	<div> </div>
`,
	1
);

var root_1 = $.from_html(
	`

<!>`,
	1
);

export default function Main($$anchor) {
	$.next();

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment));

	$.each(node, 16, () => 'abc', $.index, ($$anchor, l) => {
		$.next();

		var fragment_1 = root();
		var div = $.sibling($.first_child(fragment_1));
		var text = $.only_child(div, true);

		$.next();
		$.template_effect(() => $.set_text(text, l));
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}