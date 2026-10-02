import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Intermediate from './Intermediate.svelte';

export default function Main($$anchor) {
	let object = $.proxy({ count: 0 });

	Intermediate($$anchor, {
		get object() {
			return object;
		}
	});
}