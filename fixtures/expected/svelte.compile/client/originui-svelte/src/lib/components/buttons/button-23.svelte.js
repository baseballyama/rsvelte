import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';

var root = $.from_svg(`<svg class="pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 12L20 12" class="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"></path><path d="M4 12H20" class="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"></path><path d="M4 12H20" class="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"></path></svg>`);

export default function Button_23($$anchor) {
	let open = $.state(false);

	function toggleOpen() {
		$.set(open, !$.get(open));
	}

	{
		let $0 = $.derived(() => $.get(open) ? 'Close menu' : 'Open menu');

		Button($$anchor, {
			class: 'group',
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
				var svg = root();

				$.set_attribute(svg, 'width', 16);
				$.set_attribute(svg, 'height', 16);
				$.append($$anchor, svg);
			},
			$$slots: { default: true }
		});
	}
}