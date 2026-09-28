import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CopyButton } from '$lib/components/ui/copy-button';
import { cn } from '$lib/utils.js';
import { usePasswordCopy } from './password.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Password_copy($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		rest = $.rest_props($$props, rest_excludes);

	const state = usePasswordCopy();

	{
		let $0 = $.derived(() => cn('text-muted-foreground absolute top-1/2 right-0 size-9 min-w-0 -translate-y-1/2 hover:!bg-transparent', $$props.class));

		CopyButton($$anchor, $.spread_props(() => rest, {
			get text() {
				return state.root.passwordState.value;
			},
			tabindex: -1,
			get class() {
				return $.get($0);
			},

			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}));
	}

	$.pop();
}