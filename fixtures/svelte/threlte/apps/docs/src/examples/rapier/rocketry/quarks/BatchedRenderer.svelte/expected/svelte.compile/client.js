import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useBatchedRenderer } from './useBatchedRenderer';

export default function BatchedRenderer($$anchor, $$props) {
	$.push($$props, true);
	useBatchedRenderer();
	$.pop();
}