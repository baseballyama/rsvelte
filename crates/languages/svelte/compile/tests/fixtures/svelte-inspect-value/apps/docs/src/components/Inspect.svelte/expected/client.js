import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from 'svelte-inspect-value';
import { globalOpts } from './global-opts/globalopts.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Inspect_1($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
	let fwd = $.derived(() => ({ ...globalOpts, ...props }));

	Inspect($$anchor, $.spread_props(() => $.get(fwd), { class: 'not-content mt' }));
}