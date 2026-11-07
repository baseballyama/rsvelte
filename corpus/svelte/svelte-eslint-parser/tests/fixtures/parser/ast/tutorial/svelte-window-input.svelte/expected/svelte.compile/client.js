import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<kbd class="svelte-1h7qlrs"> </kbd> <p> </p>`, 1);
var root_1 = $.from_html(`<p>Focus this window and press any key</p>`);
var root_2 = $.from_html(`<div style="text-align: center" class="svelte-1h7qlrs"><!></div>`);

export default function Svelte_window_input($$anchor) {
	let key;
	let keyCode;

	function handleKeydown(event) {
		key = event.key;
		keyCode = event.keyCode;
	}

	var div = root_2();

	$.event('keydown', $.window, handleKeydown);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var kbd = $.first_child(fragment);
			var text = $.only_child(kbd, true);
			var p = $.sibling(kbd, 2);
			var text_1 = $.only_child(p, true);

			$.template_effect(() => {
				$.set_text(text, key === ' ' ? 'Space' : key);
				$.set_text(text_1, keyCode);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if (key) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}