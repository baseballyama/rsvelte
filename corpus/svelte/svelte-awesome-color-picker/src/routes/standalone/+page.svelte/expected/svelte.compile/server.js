import * as $ from 'svelte/internal/server';
import ColorPicker, { A11yVariant } from '$lib';

export default function _page($$renderer) {
	let hex = '#f6f0dc';
	let rgb = null;
	let hsv = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1${$.attr_style('', { 'margin-bottom': '24px' })}>color picker debug screen</h1> <div${$.attr_style('', { margin: 'auto', width: 'fit-content' })}>`);

		ColorPicker($$renderer, {
			components: A11yVariant,
			nullable: true,
			isAlpha: true,
			isDialog: false,
			a11yLevel: 'AAA',
			a11yColors: [
				{ textHex: '#FFF', reverse: true, placeholder: 'background' },
				{
					textHex: '#FFF',
					bgHex: '#FF0000',
					reverse: true,
					placeholder: 'background /w alpha'
				},
				{ bgHex: '#FFF', placeholder: 'title', size: 'large' },
				{ bgHex: '#7F7F7F', placeholder: 'button' }
			],

			get hex() {
				return hex;
			},

			set hex($$value) {
				hex = $$value;
				$$settled = false;
			},

			get rgb() {
				return rgb;
			},

			set rgb($$value) {
				rgb = $$value;
				$$settled = false;
			},

			get hsv() {
				return hsv;
			},

			set hsv($$value) {
				hsv = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}