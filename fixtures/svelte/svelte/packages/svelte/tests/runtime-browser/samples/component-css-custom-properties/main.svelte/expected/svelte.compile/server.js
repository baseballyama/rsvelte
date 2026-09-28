import * as $ from 'svelte/internal/server';
import Slider from './Slider.svelte';

export default function Main($$renderer) {
	$.css_props(
		$$renderer,
		true,
		{
			'--rail-color': 'rgb(0, 0, 0)',
			'--track-color': 'rgb(255, 0, 0)'
		},
		() => {
			Slider($$renderer, { id: 'slider-1' });
		}
	);

	$$renderer.push(` `);

	$.css_props(
		$$renderer,
		true,
		{
			'--rail-color': 'rgb(0, 255, 0)',
			'--track-color': 'rgb(0, 0, 255)'
		},
		() => {
			Slider($$renderer, { id: 'slider-2' });
		}
	);
}