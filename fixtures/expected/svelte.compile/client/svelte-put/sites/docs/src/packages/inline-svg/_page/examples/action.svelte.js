import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { inlineSvg } from '@svelte-put/inline-svg';

var root = $.from_svg(`<svg width="100" class="svelte svelte-3biusw"></svg>`);

export default function Action($$anchor, $$props) {
	let src = $.prop($$props, 'src', 3, 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg');
	var svg = root();

	$.action(svg, ($$node, $$action_arg) => inlineSvg?.($$node, $$action_arg), src);
	$.append($$anchor, svg);
}