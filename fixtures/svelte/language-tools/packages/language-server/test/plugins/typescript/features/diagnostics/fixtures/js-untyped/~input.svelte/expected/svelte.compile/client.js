import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Untyped from './untyped-js.svelte';

export default function Input($$anchor) {
	Untyped($$anchor, {
		untyped: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const untyped = $.derived(() => $$slotProps.untyped);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(untyped).worksBecauseAny));
				$.append($$anchor, text);
			}
		}
	});
}