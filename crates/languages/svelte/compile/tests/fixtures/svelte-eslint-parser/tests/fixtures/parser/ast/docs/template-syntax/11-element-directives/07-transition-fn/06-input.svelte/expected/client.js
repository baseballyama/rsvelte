import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Flies in and out</p>`);

export default function _6_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.transition(3, p, () => fly, () => ({ y: 200, duration: 2000 }));
			$.event('introstart', p, () => status = 'intro started');
			$.event('outrostart', p, () => status = 'outro started');
			$.event('introend', p, () => status = 'intro ended');
			$.event('outroend', p, () => status = 'outro ended');
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (visible) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}