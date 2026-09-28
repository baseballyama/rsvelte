import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import { FocusScope } from "./focus-scope.svelte.js";

export default function Focus_scope($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			enabled = false,
			trapFocus = false,
			loop = false,
			onCloseAutoFocus = noop,
			onOpenAutoFocus = noop,
			focusScope,
			ref
		} = $$props;

		const focusScopeState = FocusScope.use({
			enabled: boxWith(() => enabled),
			trap: boxWith(() => trapFocus),
			loop,
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus),
			onOpenAutoFocus: boxWith(() => onOpenAutoFocus),
			ref
		});

		focusScope?.($$renderer, { props: focusScopeState.props });
		$$renderer.push(`<!---->`);
	});
}