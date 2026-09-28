import * as $ from 'svelte/internal/server';
import { Transition } from '$lib/index.js';

export default function Slide($$renderer) {
	let items = [1, 2, 3, 4];
	let layout = 'flex gap-4';

	Transition($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<p class="text-6xl font-bold drop-shadow-sm">🪄 Layout Animations</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Transition($$renderer, {
		do: () => {
			items = [1, 2, 3, 4];
			layout = 'flex gap-4';
		},
		class: 'mt-16',
		children: ($$renderer) => {
			$$renderer.push(`<div${$.attr_class($.clsx(layout))}><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let item = each_array[i];

				Transition($$renderer, {
					class: 'grid h-[180px] w-[180px] place-content-center rounded-2xl border-t-2 border-white bg-gray-200 text-6xl font-semibold text-black shadow-2xl',
					entry: 'rotate',
					duration: 2,
					delay: i * 0.1,
					visible: true,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(item)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Transition($$renderer, {
		transitions: [
			() => {
				layout = 'grid grid-cols-2 grid-rows-2 gap-4';
				items = [4, 3, 2, 1];
			},

			() => {
				layout = 'grid grid-cols-2 grid-rows-2 gap-4';
				items = [2, 1, 4, 3];
			},

			() => {
				layout = 'grid grid-cols-2 grid-rows-2 gap-4';
				items = [4, 3, 2, 1];
			},

			() => {
				layout = 'grid grid-cols-2 grid-rows-2 gap-4';
				items = [1, 2, 3, 4];
			},
			() => layout = 'flex gap-4'
		]
	});

	$$renderer.push(`<!---->`);
}