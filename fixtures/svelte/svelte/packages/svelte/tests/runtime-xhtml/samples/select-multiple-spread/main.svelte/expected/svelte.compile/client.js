import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Select from './select.svelte';

export default function Main($$anchor, $$props) {
	let attrs = $.prop($$props, 'attrs', 19, () => ({ value: ['1'] }));

	Select($$anchor, {
		get attrs() {
			return attrs();
		}
	});
}