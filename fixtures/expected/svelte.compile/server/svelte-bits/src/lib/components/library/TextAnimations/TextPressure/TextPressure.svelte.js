import * as $ from 'svelte/internal/server';

export default function TextPressure($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			text = 'Compressa',
			fontFamily = 'Compressa VF',
			fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
			width = true,
			weight = true,
			italic = true,
			alpha = false,
			flex = true,
			stroke = false,
			scale = false,
			textColor = '#FFFFFF',
			strokeColor = '#FF0000',
			class: className = '',
			minFontSize = 24
		} = $$props;

		let containerEl = void 0;
		let titleEl = void 0;
		let spans = [];

		// svelte-ignore state_referenced_locally
		let fontSize = minFontSize;

		let scaleY = 1;
		let lineHeight = 1;
		const chars = $.derived(() => text.split(''));

		$$renderer.push(`<div class="text-pressure-container svelte-flls7y"><h1${$.attr_class(
			`text-pressure-title ${$.stringify(
				// FontFace unsupported — silently skip; the fallback family kicks in.
				className
			)} ${flex ? 'flex-layout' : ''} ${stroke ? 'has-stroke' : ''}`,
			'svelte-flls7y'
		)}${$.attr_style(`font-family:${$.stringify(fontFamily)};font-size:${$.stringify(fontSize)}px;line-height:${$.stringify(lineHeight)};transform:scale(1, ${$.stringify(scaleY)});color:${$.stringify(textColor)};--text-pressure-stroke:${$.stringify(strokeColor)};`)}><!--[-->`);

		const each_array = $.ensure_array_like(chars());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let char = each_array[i];

			$$renderer.push(`<span${$.attr('data-char', char)}${$.attr_style(`display:inline-block;color:${$.stringify(stroke ? 'inherit' : textColor)};`)} class="svelte-flls7y">${$.escape(char)}</span>`);
		}

		$$renderer.push(`<!--]--></h1></div>`);
	});
}