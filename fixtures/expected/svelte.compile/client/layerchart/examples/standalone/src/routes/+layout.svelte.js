import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher, mode, toggleMode } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<!> <main><div class="pb-4 text-right"><button> </button></div> <!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_1();

	$.head('6ylje1', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var main = $.sibling(node, 2);
	var div = $.child(main);
	var button = $.child(div);
	var text = $.only_child(button);

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(main);
	$.template_effect(() => $.set_text(text, `${mode.current === 'dark' ? '🌞' : '🌙'} Toggle mode`));

	$.delegated('click', button, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);