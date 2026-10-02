import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Log out</button>`);
var root_1 = $.from_html(`<button>Log in</button>`);

export default function Else_blocks_input($$anchor) {
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.event('click', button, toggle);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var button_1 = root_1();

			$.event('click', button_1, toggle);
			$.append($$anchor, button_1);
		};

		$.if(node, ($$render) => {
			if (user.loggedIn) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}