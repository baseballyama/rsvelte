import * as $ from 'svelte/internal/server';
import Slider1 from './Slider1.svelte';
import Slider2 from './Slider2.svelte';

export default function Main($$renderer) {
	$.css_props(
		$$renderer,
		true,
		{
			'--rail-color': 'rgb(0, 0, 0)',
			'--track-color': 'rgb(255, 0, 0)'
		},
		() => {
			Slider1($$renderer, { id: 'component1' });
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
			Slider2($$renderer, { id: 'component2' });
		}
	);
}