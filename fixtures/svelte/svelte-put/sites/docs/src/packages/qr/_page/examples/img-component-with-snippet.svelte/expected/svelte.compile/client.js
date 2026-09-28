import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import QR from '@svelte-put/qr/img/QR.svelte';

var root = $.from_html(`<img alt="qr"/>`);

export default function Img_component_with_snippet($$anchor) {
	{
		const img = ($$anchor, $$arg0) => {
			let src = () => ($$arg0?.()).src;
			var img_1 = root();

			$.template_effect(() => $.set_attribute(img_1, 'src', src()));
			$.append($$anchor, img_1);
		};

		QR($$anchor, {
			data: 'https://svelte.dev',
			logo: 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg',
			logoRatio: 107 / 128,
			shape: 'square',
			anchorInnerFill: 'tomato',
			anchorOuterFill: 'tomato',
			moduleFill: 'tomato',
			margin: 4,
			width: '500',
			height: '500',
			img,
			$$slots: { img: true }
		});
	}
}