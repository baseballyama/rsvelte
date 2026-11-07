import 'svelte/internal/disclose-version';
import { c } from './c';
import * as $ from 'svelte/internal/client';
import B from './B';
import A from './A';

export default function Organize_imports_with_module($$anchor) {
	A($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, c));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}