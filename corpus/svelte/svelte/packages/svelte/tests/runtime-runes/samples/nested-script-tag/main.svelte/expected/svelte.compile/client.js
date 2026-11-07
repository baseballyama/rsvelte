import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<div><script>
		console.log('init');
	</script><!></div>`));

export default function Main($$anchor) {
	var div = root();

	$.append($$anchor, div);
}