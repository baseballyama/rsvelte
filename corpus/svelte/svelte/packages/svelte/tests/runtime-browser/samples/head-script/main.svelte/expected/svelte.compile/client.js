import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(
	`<script>
		// A comment
		const val = 'Hello world';
		document.addEventListener('DOMContentLoaded', () => {
			document.querySelector('button').textContent = val;
		});
	</script><!>`,
	1
));

var root_1 = $.from_html(`<button>click me</button>`);

export default function Main($$anchor) {
	var button = root_1();

	$.head('wgt45c', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment));

		$.append($$anchor, fragment);
	});

	$.append($$anchor, button);
}