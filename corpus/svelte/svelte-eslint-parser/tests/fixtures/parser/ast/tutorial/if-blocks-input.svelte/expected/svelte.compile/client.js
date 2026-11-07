import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Log out</button>`);
var root_1 = $.from_html(`<button>Log in</button>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function If_blocks_input($$anchor) {
	let user = { loggedIn: false };

	function toggle() {
		user.loggedIn = !user.loggedIn;
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.event('click', button, toggle);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (user.loggedIn) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button_1 = root_1();

			$.event('click', button_1, toggle);
			$.append($$anchor, button_1);
		};

		$.if(node_1, ($$render) => {
			if (!user.loggedIn) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}