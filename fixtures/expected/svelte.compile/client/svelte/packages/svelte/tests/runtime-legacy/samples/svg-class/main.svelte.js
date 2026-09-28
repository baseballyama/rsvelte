import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg class="foo"></svg>`);

export default function Main($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}