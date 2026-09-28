import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let time = new Date();
	let timeZone = 'UTC';

	(() => {})();
	$.pop();
}