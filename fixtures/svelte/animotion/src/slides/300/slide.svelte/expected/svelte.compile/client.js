import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Transition } from '$lib/index.js';

var root = $.from_html(`<p class="text-6xl font-bold drop-shadow-sm">🪄 Layout Animations</p>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Slide($$anchor) {
	let items = $.state($.proxy([1, 2, 3, 4]));
	let layout = $.state('flex gap-4');
	var fragment = root_2();
	var node = $.first_child(fragment);

	Transition(node, {
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Transition(node_1, {
		do: () => {
			$.set(items, [1, 2, 3, 4], true);
			$.set(layout, 'flex gap-4');
		},
		class: 'mt-16',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();

			$.each(div, 22, () => $.get(items), (item) => item, ($$anchor, item, i) => {
				{
					let $0 = $.derived(() => $.get(i) * 0.1);

					Transition($$anchor, {
						class: 'grid h-[180px] w-[180px] place-content-center rounded-2xl border-t-2 border-white bg-gray-200 text-6xl font-semibold text-black shadow-2xl',
						entry: 'rotate',
						duration: 2,
						get delay() {
							return $.get($0);
						},
						visible: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, item));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div);
			$.template_effect(() => $.set_class(div, 1, $.clsx($.get(layout))));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Transition(node_2, {
		transitions: [
			() => {
				$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
				$.set(items, [4, 3, 2, 1], true);
			},

			() => {
				$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
				$.set(items, [2, 1, 4, 3], true);
			},

			() => {
				$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
				$.set(items, [4, 3, 2, 1], true);
			},

			() => {
				$.set(layout, 'grid grid-cols-2 grid-rows-2 gap-4');
				$.set(items, [1, 2, 3, 4], true);
			},
			() => $.set(layout, 'flex gap-4')
		]
	});

	$.append($$anchor, fragment);
}