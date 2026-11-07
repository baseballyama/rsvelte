import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><style>/* prettier-ignore */
    .test {
      fill: red;
    }</style></svg>`);

export default function Inline_style_tag_input($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}