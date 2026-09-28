import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Expandable from './components/Expandable.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function CustomExpandable($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	Expandable($$anchor, $.spread_props(() => props));
}