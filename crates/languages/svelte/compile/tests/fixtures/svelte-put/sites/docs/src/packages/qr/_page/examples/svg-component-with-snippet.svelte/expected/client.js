import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import QR from '@svelte-put/qr/svg/QR.svelte';

var root = $.from_svg(`<svg></svg>`);

export default function Svg_component_with_snippet($$anchor) {
	{
		const svg = ($$anchor, $$arg0) => {
			let attributes = () => ($$arg0?.()).attributes;
			let innerHTML = () => ($$arg0?.()).innerHTML;
			var svg_1 = root();

			$.attribute_effect(svg_1, () => ({ ...attributes(), class: '**:fill-blue-500' }));
			$.html(svg_1, innerHTML, true);
			$.reset(svg_1);
			$.append($$anchor, svg_1);
		};

		QR($$anchor, {
			data: 'https://svelte.dev',
			logo: 'https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg',
			logoRatio: 107 / 128,
			shape: 'square',
			margin: 4,
			svg,
			$$slots: { svg: true }
		});
	}
}