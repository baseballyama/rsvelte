import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMountEffect } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";

export default function Mounted($$anchor, $$props) {
	$.push($$props, true);

	let mounted = $.prop($$props, 'mounted', 15, false),
		onMountedChange = $.prop($$props, 'onMountedChange', 3, noop);

	onMountEffect(() => {
		mounted(true);
		onMountedChange()(true);

		return () => {
			mounted(false);
			onMountedChange()(false);
		};
	});

	$.pop();
}