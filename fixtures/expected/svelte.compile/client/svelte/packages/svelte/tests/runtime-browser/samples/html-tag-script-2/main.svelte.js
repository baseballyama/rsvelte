import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(`<script></script><!>`, 1));
var root_1 = $.with_script($.from_html(`<div><script></script><!></div> <!> <!>`, 1));

export default function Main($$anchor) {
	var fragment = root_1();
	var node_1 = $.sibling($.first_child(fragment), 2);

	$.html(node_1, () => `<script>document.body.innerHTML = 'this should not be executed'</script>`);

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_3 = $.sibling($.first_child(fragment_1));

			$.html(node_3, () => `<script>document.body.innerHTML = 'this neither'</script>`);
			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}