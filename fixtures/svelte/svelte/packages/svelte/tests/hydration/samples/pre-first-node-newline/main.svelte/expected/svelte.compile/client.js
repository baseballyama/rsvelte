import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`<pre>static content no line</pre> <pre>
	static content ignored line
</pre> <pre>

	static content relevant line
</pre> <pre><div><span></span></div>
</pre> <pre>

<div><span></span></div>
</pre>`,
	1
);

export default function Main($$anchor) {
	let name = '';
	var fragment = root();
	var pre = $.sibling($.first_child(fragment), 6);
	var div = $.child(pre);
	var span = $.only_child(div);

	$.next();
	$.reset(pre);

	var pre_1 = $.sibling(pre, 2);
	var div_1 = $.sibling($.child(pre_1));
	var span_1 = $.only_child(div_1);

	$.next();
	$.reset(pre_1);
	$.append($$anchor, fragment);
}