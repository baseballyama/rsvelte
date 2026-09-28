import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import Button from '$lib/components/ui/button/button.svelte';

var root = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-black"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg> <div class="flex flex-col text-left leading-3"><span class="hidden font-medium text-gray-600 sm:block">Prev</span> <span class="font-semibold text-xs pt-1"> </span></div>`, 1);

export default function Back_button($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, 'Dashboard'),
		to = $.prop($$props, 'to', 3, '/dash');

	function go() {
		if (to()) {
			goto(to());
		} else {
			history.back();
			goto('/dash');
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				class: 'h-auto px-4 py-2',
				onclick: go,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div = $.sibling($.first_child(fragment_2), 2);
					var span = $.sibling($.child(div), 2);
					var text = $.only_child(span, true);

					$.reset(div);
					$.template_effect(() => $.set_text(text, title()));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (title()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}