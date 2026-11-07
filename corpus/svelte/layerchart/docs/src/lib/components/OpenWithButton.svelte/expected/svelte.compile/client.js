import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSettings } from 'layerchart';
import { OpenWithButton } from '@layerstack/docs/components';

export default function OpenWithButton_1($$anchor, $$props) {
	$.push($$props, true);

	// Thin adapter around the shared `@layerstack/docs` component, injecting
	// LayerChart-specific config (branding + the active chart `layer`) so existing
	// call sites can keep using `<OpenWithButton {metadata} />` unchanged.
	let metadata = $.prop($$props, 'metadata', 19, () => ({})),
		example = $.prop($$props, 'example', 3, false);

	const settings = getSettings();

	const pkg = {
		name: 'LayerChart',
		url: 'https://layerchart.com/docs',
		description: 'A charting/visualization library for Svelte 5'
	};

	{
		let $0 = $.derived(() => settings?.layer);

		OpenWithButton($$anchor, {
			get metadata() {
				return metadata();
			},

			get example() {
				return example();
			},

			get pkg() {
				return pkg;
			},

			get layer() {
				return $.get($0);
			}
		});
	}

	$.pop();
}