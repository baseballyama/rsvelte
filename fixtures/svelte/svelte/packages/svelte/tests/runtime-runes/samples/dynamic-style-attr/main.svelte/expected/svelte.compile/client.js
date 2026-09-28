import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello world</div> <button>Make blue</button>`, 1);

export default function Main($$anchor) {
	let color = $.state('red');
	const getColor = () => $.get(color);
	var fragment = root();
	var div = $.first_child(fragment);
	var button = $.sibling(div, 2);

	$.template_effect(($0) => $.set_style(div, `background-color: ${$0 ?? ''};`), [() => getColor()]);
	$.delegated('click', button, () => $.set(color, 'blue'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);