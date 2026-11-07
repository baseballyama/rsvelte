import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.with_script($.from_html(
	`<script>
		document.body.querySelector('.after').innerHTML = 'this should be executed';
	</script><!>`,
	1
));

var root_1 = $.from_html(`<button>hide</button> <!> <div class="after">after</div>`, 1);

export default function Main($$anchor) {
	let visible = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.next(2);
	$.delegated('click', button, () => $.set(visible, false));
	$.append($$anchor, fragment);
}

$.delegate(['click']);