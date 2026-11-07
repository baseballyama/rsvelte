import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p> <p></p> <p></p> <p></p> <p></p>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	$.set_style(p, '', {}, { '--a': 0 });

	var p_1 = $.sibling(p, 2);

	$.set_style(p_1, '', {}, { '--b': false });

	var p_2 = $.sibling(p_1, 2);

	$.set_style(p_2, '', {}, { '--c': '' });

	var p_3 = $.sibling(p_2, 2);

	$.set_style(p_3, '', {}, { '--d': undefined });

	var p_4 = $.sibling(p_3, 2);

	$.set_style(p_4, '', {}, { '--e': null });
	$.append($$anchor, fragment);
}