import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Plus from '@lucide/svelte/icons/plus';

export default function Button_21($$anchor) {
	let open = $.state(false);

	function toggleOpen() {
		$.set(open, !$.get(open));
	}

	{
		let $0 = $.derived(() => $.get(open) ? 'Close menu' : 'Open menu');

		Button($$anchor, {
			class: 'group rounded-full',
			variant: 'outline',
			size: 'icon',
			onclick: toggleOpen,
			get 'aria-expanded'() {
				return $.get(open);
			},

			get 'aria-label'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Plus($$anchor, {
					class: 'transition-transform duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)] group-aria-expanded:rotate-135',
					size: 16,
					'aria-hidden': 'true'
				});
			},
			$$slots: { default: true }
		});
	}
}