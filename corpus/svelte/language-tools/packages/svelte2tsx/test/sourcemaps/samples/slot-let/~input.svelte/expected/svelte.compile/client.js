import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	Component($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const hi = $.derived(() => $$slotProps.hi);
				const hi_2 = $.derived(() => $$slotProps.hi2);
				const hi3 = $.derived(() => $$slotProps.hi3);

				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `${$.get(hi) ?? ''}${$.get(hi_2) ?? ''}${$.get(hi3) ?? ''}`));
				$.append($$anchor, text);
			}
		}
	});
}