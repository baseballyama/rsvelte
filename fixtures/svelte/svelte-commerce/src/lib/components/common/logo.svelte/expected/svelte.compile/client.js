import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<img class="h-9 w-auto max-w-[200px] object-contain"/>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<a><!></a>`);

export default function Logo($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Store brand mark: the uploaded store logo when present, otherwise the store name as a
	 * text wordmark — the same fallback the header uses. `variant="light"` renders white
	 * text for dark backgrounds (the editorial footer recolors .text-white to ink itself).
	 */
	let href = $.prop($$props, 'href', 3, '/'),
		variant = $.prop($$props, 'variant', 3, 'default'),
		className = $.prop($$props, 'class', 3, '');

	const store = $.derived(() => page?.data?.store);
	const name = $.derived(() => $.get(store)?.name || 'Svelte Commerce');
	var a = root_2();
	var node = $.child(a);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(store).logo);
				$.set_attribute(img, 'alt', $.get(name));
			});

			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var span = root_1();
			var text = $.only_child(span, true);

			$.template_effect(() => {
				$.set_class(span, 1, `font-serif text-[1.5rem] font-bold tracking-[0.02em] ${variant() === 'light' ? 'text-white' : 'text-foreground'}`);
				$.set_text(text, $.get(name));
			});

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(store)?.logo) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(a);

	$.template_effect(() => {
		$.set_attribute(a, 'href', href());
		$.set_class(a, 1, `inline-flex items-center leading-none ${className() ?? ''}`);
		$.set_attribute(a, 'aria-label', `${$.get(name) ?? ''} — home`);
	});

	$.append($$anchor, a);
	$.pop();
}