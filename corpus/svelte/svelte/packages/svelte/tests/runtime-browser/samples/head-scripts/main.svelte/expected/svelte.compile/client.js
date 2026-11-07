import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<script async="" defer=""></script><!>`, 1));
var root_1 = $.from_html(`<b id="r1">?</b><b id="r2">?</b><b id="r3">?</b>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function jssrc(src) {
		return 'data:text/javascript;base64, ' + btoa(src);
	}

	const scriptSrcs = [1, 2, 3].map((n) => jssrc(`document.getElementById('r${n}').innerText = '${n}';`));
	var fragment_2 = root_1();

	$.head('1m15e9h', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => scriptSrcs, $.index, ($$anchor, src) => {
			var fragment_1 = root();
			var script = $.first_child(fragment_1);
			var node_1 = $.sibling(script);

			$.template_effect(() => $.set_attribute(script, 'src', $.get(src)));
			$.append($$anchor, fragment_1);
		});

		$.append($$anchor, fragment);
	});

	$.next(2);
	$.append($$anchor, fragment_2);
	$.pop();
}