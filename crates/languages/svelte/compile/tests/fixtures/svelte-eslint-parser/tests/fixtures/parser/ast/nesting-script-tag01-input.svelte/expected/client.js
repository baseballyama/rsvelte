import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<div><script>
		let a;
	</script><!></div>`));

export default function Nesting_script_tag01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}