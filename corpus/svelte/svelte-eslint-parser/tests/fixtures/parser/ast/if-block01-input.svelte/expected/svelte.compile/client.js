import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function If_block01_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};
		var consequent_1 = ($$anchor) => {};
		var alternate = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (expression) $$render(consequent); else if (expression) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}