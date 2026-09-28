import * as $ from 'svelte/internal/server';

export default function PreviewColorPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = '', value = '#ffffff', onChange } = $$props;
		let hex = $.derived(() => value);

		function commitHex(v) {
			const trimmed = v.trim();

			if ((/^#?[0-9a-fA-F]{6}$/).test(trimmed)) {
				const next = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

				onChange?.(next.toLowerCase());
			}
		}

		$$renderer.push(`<div class="scrubber"><div class="scrubber-track scrubber-track--color" role="group"${$.attr('aria-label', title)}><div class="scrubber-label">${$.escape(title)}</div> <div class="scrubber-color-controls"><input class="scrubber-color-text" type="text"${$.attr('value', hex())}/> <label class="scrubber-color-swatch-preview"${$.attr_style('', { background: value })}><input type="color"${$.attr('value', value)} style="opacity:0;width:100%;height:100%;cursor:pointer;"/></label></div></div></div>`);
	});
}