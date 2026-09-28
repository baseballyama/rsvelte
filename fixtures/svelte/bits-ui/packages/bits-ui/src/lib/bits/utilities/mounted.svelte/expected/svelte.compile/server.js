import * as $ from 'svelte/internal/server';
import { onMountEffect } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";

export default function Mounted($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { mounted = false, onMountedChange = noop } = $$props;

		onMountEffect(() => {
			mounted = true;
			onMountedChange(true);

			return () => {
				mounted = false;
				onMountedChange(false);
			};
		});

		$.bind_props($$props, { mounted });
	});
}