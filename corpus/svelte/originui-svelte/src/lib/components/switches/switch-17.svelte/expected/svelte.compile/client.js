import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

var root = $.from_html(`Label <span class="text-muted-foreground text-xs leading-[inherit] font-normal">(Sublabel)</span>`, 1);
var root_1 = $.from_html(`<div class="border-input has-data-[state=checked]:border-ring relative flex w-full items-start gap-2 rounded-lg border p-4 shadow-xs shadow-black/[.04]"><!> <div class="flex grow items-center gap-3"><svg class="shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#121212"></circle><g clip-path="url(#sb-a)"><path fill="url(#sb-b)" d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"></path><path fill="url(#sb-c)" fill-opacity=".2" d="M17.63 25.52c-.506.637-1.533.287-1.545-.526l-.178-11.903h8.003c1.45 0 2.259 1.674 1.357 2.81l-7.637 9.618Z"></path><path fill="#3ECF8E" d="M14.375 6.367c.506-.638 1.532-.289 1.544.525l.078 11.903H8.094c-1.45 0-2.258-1.674-1.357-2.81l7.638-9.618Z"></path></g><defs><linearGradient id="sb-b" x1="15.907" x2="23.02" y1="15.73" y2="18.713" gradientUnits="userSpaceOnUse"><stop stop-color="#249361"></stop><stop offset="1" stop-color="#3ECF8E"></stop></linearGradient><linearGradient id="sb-c" x1="12.753" x2="15.997" y1="11.412" y2="17.519" gradientUnits="userSpaceOnUse"><stop></stop><stop offset="1" stop-opacity="0"></stop></linearGradient><clipPath id="sb-a"><path fill="#fff" d="M6.354 6h19.292v20H6.354z"></path></clipPath></defs></svg> <div class="grid grow gap-2"><!> <p class="text-muted-foreground text-xs">A short description goes here.</p></div></div></div>`);

export default function Switch_17($$anchor) {
	const uid = $.props_id();
	let checked = $.state(false);
	var div = root_1();
	var node = $.child(div);

	Switch(node, {
		get id() {
			return uid;
		},
		class: 'order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2 data-[state=checked]:[&_span]:rtl:-translate-x-2',
		get 'aria-describedby'() {
			return `${uid}-description`;
		},

		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var div_1 = $.sibling(node, 2);
	var svg = $.child(div_1);

	$.set_attribute(svg, 'width', 32);
	$.set_attribute(svg, 'height', 32);

	var div_2 = $.sibling(svg, 2);
	var node_1 = $.child(div_2);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_1, 2);

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_attribute(p, 'id', `${uid}-description`));
	$.append($$anchor, div);
}