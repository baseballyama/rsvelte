import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { qr } from '@svelte-put/qr/svg';

var root = $.from_svg(`<svg></svg>`);

export default function Svg_action($$anchor) {
	var svg = root();

	$.action(svg, ($$node, $$action_arg) => qr?.($$node, $$action_arg), () => ({
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		logo: 'https://svelte-put.vnphanquang.com/images/svelte-put-logo.svg',
		shape: 'circle'
	}));

	$.append($$anchor, svg);
}