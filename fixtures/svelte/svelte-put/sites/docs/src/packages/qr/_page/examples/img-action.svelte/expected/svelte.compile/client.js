import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { qr } from '@svelte-put/qr/img';

var root = $.from_html(`<img alt="qr"/>`);

export default function Img_action($$anchor) {
	var img = root();

	$.action(img, ($$node, $$action_arg) => qr?.($$node, $$action_arg), () => ({
		data: 'https://svelte-put.vnphanquang.com/docs/qr',
		logo: 'https://svelte-put.vnphanquang.com/images/svelte-put-logo.svg',
		shape: 'circle',
		anchorInnerFill: 'gray',
		anchorOuterFill: 'gray',
		moduleFill: 'gray',
		width: 500,
		height: 500
	}));

	$.replay_events(img);
	$.append($$anchor, img);
}