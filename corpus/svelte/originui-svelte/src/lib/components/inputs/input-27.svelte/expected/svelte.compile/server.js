import * as $ from 'svelte/internal/server';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';
import Mic from '@lucide/svelte/icons/mic';
import Search from '@lucide/svelte/icons/search';
import { onDestroy } from 'svelte';

export default function Input_27($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);
		let inputValue = '';
		let isLoading = false;
		let timer = null;

		const handleInput = () => {
			if (timer) clearTimeout(timer);

			if (!inputValue) {
				isLoading = false;

				return;
			}

			isLoading = true;

			timer = setTimeout(
				() => {
					isLoading = false;
					timer = null;
				},
				500
			);
		};

		onDestroy(() => {
			if (timer) clearTimeout(timer);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="*:not-first:mt-2">`);

			Label($$renderer, {
				for: uid,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Search input with loader`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative">`);

			Input($$renderer, {
				id: uid,
				class: 'peer ps-9 pe-9',
				placeholder: 'Search...',
				type: 'search',
				oninput: handleInput,
				get value() {
					return inputValue;
				},

				set value($$value) {
					inputValue = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">`);

			if (isLoading) {
				$$renderer.push('<!--[0-->');

				LoaderCircle($$renderer, {
					class: 'animate-spin',
					size: 16,
					'aria-hidden': 'true',
					role: 'presentation'
				});
			} else {
				$$renderer.push('<!--[-1-->');
				Search($$renderer, { size: 16, 'aria-hidden': 'true' });
			}

			$$renderer.push(`<!--]--></div> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Press to speak" type="submit">`);
			Mic($$renderer, { size: 16, 'aria-hidden': 'true' });
			$$renderer.push(`<!----></button></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}