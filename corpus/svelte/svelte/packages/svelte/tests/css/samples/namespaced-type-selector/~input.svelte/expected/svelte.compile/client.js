import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg class="svelte-18t66gh"><circle class="svelte-18t66gh"></circle></svg>`);

export default function Input($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}