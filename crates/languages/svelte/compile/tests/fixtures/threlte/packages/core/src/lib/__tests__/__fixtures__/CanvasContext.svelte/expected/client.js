import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Canvas from '../../Canvas.svelte';
import { useThrelte } from '../../context/compounds/useThrelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'oncontext']);

export default function CanvasContext($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);

	Canvas($$anchor, $.spread_props(() => rest, {
		children: ($$anchor, $$slotProps) => {
			const ctx = $.derived(useThrelte);

			$.next();

			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [() => $$props.oncontext?.($.get(ctx))]);
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	}));

	$.pop();
}