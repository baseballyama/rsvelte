import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';
import { set_translation } from './translations.svelte.js';

var root = $.from_html(`<!> <button>Change Language</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Sub(node, {});

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => set_translation('Hola'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);