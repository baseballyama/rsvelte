import * as $ from 'svelte/internal/server';
import { getSettings } from 'layerchart';
import { OpenWithButton } from '@layerstack/docs/components';

export default function OpenWithButton_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Thin adapter around the shared `@layerstack/docs` component, injecting
		// LayerChart-specific config (branding + the active chart `layer`) so existing
		// call sites can keep using `<OpenWithButton {metadata} />` unchanged.
		let { metadata = {}, example = false } = $$props;

		const settings = getSettings();

		const pkg = {
			name: 'LayerChart',
			url: 'https://layerchart.com/docs',
			description: 'A charting/visualization library for Svelte 5'
		};

		OpenWithButton($$renderer, { metadata, example, pkg, layer: settings?.layer });
	});
}