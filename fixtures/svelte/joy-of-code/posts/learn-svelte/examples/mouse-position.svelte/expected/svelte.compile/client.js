import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1yst2r4"> </div>`);

export default function Mouse_position($$anchor, $$props) {
	$.push($$props, true);

	let mouse = $.proxy({ x: 0, y: 0 });

	function onmousemove(e) {
		const rect = this.getBoundingClientRect();

		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	}

	var div = root();
	var text = $.only_child(div);

	$.template_effect(($0, $1) => $.set_text(text, `The mouse position is ${$0 ?? ''} x ${$1 ?? ''}`), [() => mouse.x.toFixed(), () => mouse.y.toFixed()]);
	$.delegated('mousemove', div, onmousemove);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousemove']);