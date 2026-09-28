import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Button from '$lib/components/ui/button/button.svelte';
import { ShoppingBag, Home, ArrowLeft } from '@lucide/svelte';
import { goto } from '$app/navigation';

var root = $.from_html(`<!> Go Back`, 1);
var root_1 = $.from_html(`<!> Return Home`, 1);
var root_2 = $.from_html(`<div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4"><div class="text-center"><div class="mb-4 flex justify-center"><!></div> <h1 class="mb-2 text-6xl font-bold text-primary"> </h1> <h2 class="mb-8 text-2xl font-semibold text-gray-600"> </h2> <p class="mb-8 text-gray-500"><!></p> <div class="flex flex-col gap-4 sm:flex-row sm:justify-center"><!> <!></div></div></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var div = root_2();

	$.head('13yhkn3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Product Not Found';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	ShoppingBag(node, { class: 'h-24 w-24 animate-bounce text-primary' });
	$.reset(div_2);

	var h1 = $.sibling(div_2, 2);
	var text = $.only_child(h1, true);
	var h2 = $.sibling(h1, 2);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var node_1 = $.child(p);

	{
		var consequent = ($$anchor) => {
			var text_2 = $.text('The product you\'re looking for doesn\'t exist.');

			$.append($$anchor, text_2);
		};

		var alternate = ($$anchor) => {
			var text_3 = $.text('We encountered an unexpected error. Our team has been notified.');

			$.append($$anchor, text_3);
		};

		$.if(node_1, ($$render) => {
			if (page.status === 404) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(p);

	var div_3 = $.sibling(p, 2);
	var node_2 = $.child(div_3);

	Button(node_2, {
		variant: 'outline',
		class: 'gap-2',
		onclick: () => {
			// if (window.history?.length > 1) {
			// 	window.history.back()
			// } else {
			goto('/products');

			// }
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			ArrowLeft(node_3, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		class: 'gap-2',
		onclick: () => goto('/'),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_5 = $.first_child(fragment_1);

			Home(node_5, { class: 'h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, page.error?.message || 'Something went wrong');
	});

	$.append($$anchor, div);
	$.pop();
}