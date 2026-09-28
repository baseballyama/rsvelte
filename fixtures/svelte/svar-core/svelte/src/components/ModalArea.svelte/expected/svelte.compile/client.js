import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from "svelte/transition";

var root = $.from_html(`<div class="wx-modal svelte-6x8wgo"><div class="wx-window svelte-6x8wgo"><!></div></div>`);

export default function ModalArea($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.transition(3, div, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, div);
}