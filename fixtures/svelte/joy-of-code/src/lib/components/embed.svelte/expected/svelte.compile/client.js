import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-2a7m49"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--clr-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> </button>`);
var root_1 = $.from_html(`<iframe loading="lazy" allowfullscreen="" class="svelte-2a7m49"></iframe>`);
var root_2 = $.from_html(`<p class="embed example svelte-2a7m49"><!></p>`);

export default function Embed($$anchor, $$props) {
	let loaded = $.state(false);
	var p = root_2();
	var node = $.child(p);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var text = $.sibling($.child(button));

			$.reset(button);
			$.template_effect(() => $.set_text(text, ` Load ${$$props.title ?? ''}`));
			$.delegated('click', button, () => $.set(loaded, !$.get(loaded)));
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var iframe = root_1();

			$.template_effect(() => {
				$.set_attribute(iframe, 'title', $$props.title);
				$.set_attribute(iframe, 'src', $$props.src);
			});

			$.append($$anchor, iframe);
		};

		$.if(node, ($$render) => {
			if (!$.get(loaded)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(p);
	$.append($$anchor, p);
}

$.delegate(['click']);