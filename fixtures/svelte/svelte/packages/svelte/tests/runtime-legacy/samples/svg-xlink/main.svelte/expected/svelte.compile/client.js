import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><defs><circle id="stamp" r="10" fill="blue"></circle></defs><use xlink:href="#stamp" x="20" y="20"></use></svg>`);

export default function Main($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}