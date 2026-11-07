import * as $ from 'svelte/internal/server';
import { register } from '../util/registerLayer';

export default function Layer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...layer } = $$props;
		const layerId = register(layer);

		$$renderer.push(`<div${$.attr('data-layer-id', layerId)}></div>`);
	});
}