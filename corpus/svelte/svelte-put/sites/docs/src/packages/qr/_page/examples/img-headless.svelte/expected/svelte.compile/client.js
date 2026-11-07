import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createQrPngDataUrl } from '@svelte-put/qr';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="flex flex-col items-center gap-2"><img width="180" height="180" alt="a qr code"/> <a class="c-btn" download="qr.png">Download QR as PNG</a></div>`);

export default function Img_headless($$anchor, $$props) {
	$.push($$props, true);

	const config = {
		data: 'https://svelte.dev',
		width: 500,
		height: 500,
		backgroundFill: '#fff'
	};

	let src = '';

	onMount(async () => {
		src = await createQrPngDataUrl(config);
	});

	var div = root();
	var img = $.child(div);
	var a = $.sibling(img, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', src);
		$.set_attribute(a, 'href', src);
	});

	$.append($$anchor, div);
	$.pop();
}