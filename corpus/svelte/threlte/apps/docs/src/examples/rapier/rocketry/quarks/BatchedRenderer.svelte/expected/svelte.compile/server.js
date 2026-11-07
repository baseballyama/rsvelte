import * as $ from 'svelte/internal/server';
import { useBatchedRenderer } from './useBatchedRenderer';

export default function BatchedRenderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		useBatchedRenderer();
	});
}