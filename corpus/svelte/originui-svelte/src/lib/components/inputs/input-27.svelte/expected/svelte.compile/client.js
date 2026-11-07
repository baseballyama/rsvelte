import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import LoaderCircle from '@lucide/svelte/icons/loader-circle';
import Mic from '@lucide/svelte/icons/mic';
import Search from '@lucide/svelte/icons/search';
import { onDestroy } from 'svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Press to speak" type="submit"><!></button></div></div>`);

export default function Input_27($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let inputValue = $.state('');
	let isLoading = $.state(false);
	let timer = $.state(null);

	const handleInput = () => {
		if ($.get(timer)) clearTimeout($.get(timer));

		if (!$.get(inputValue)) {
			$.set(isLoading, false);

			return;
		}

		$.set(isLoading, true);

		$.set(
			timer,
			setTimeout(
				() => {
					$.set(isLoading, false);
					$.set(timer, null);
				},
				500
			),
			true
		);
	};

	onDestroy(() => {
		if ($.get(timer)) clearTimeout($.get(timer));
	});

	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Search input with loader');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'peer ps-9 pe-9',
		placeholder: 'Search...',
		type: 'search',
		oninput: handleInput,
		get value() {
			return $.get(inputValue);
		},

		set value($$value) {
			$.set(inputValue, $$value, true);
		}
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			LoaderCircle($$anchor, {
				class: 'animate-spin',
				size: 16,
				'aria-hidden': 'true',
				role: 'presentation'
			});
		};

		var alternate = ($$anchor) => {
			Search($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		$.if(node_2, ($$render) => {
			if ($.get(isLoading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div_2);

	var button = $.sibling(div_2, 2);
	var node_3 = $.child(button);

	Mic(node_3, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}