import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Page from './Component.svelte';

export default function Main($$anchor) {
	let data = $.proxy({ form: { data: { tags: { first: 1, second: 2 } } } });

	Page($$anchor, {
		get data() {
			return data;
		}
	});
}