import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

var root = $.from_html(`<div class="bg-content-nav-wrap svelte-1hm6q66"><div class="bg-content-nav bg-content-glass svelte-1hm6q66"><div class="bg-content-logo-wrap svelte-1hm6q66"><img alt="" class="svelte-1hm6q66"/></div> <div class="bg-content-menu-icon svelte-1hm6q66"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg></div> <div class="bg-content-nav-links svelte-1hm6q66"><span class="svelte-1hm6q66">Features</span> <span class="svelte-1hm6q66">About</span> <span class="bg-content-signup svelte-1hm6q66">Sign up</span></div></div></div> <div class="bg-content-hero svelte-1hm6q66"><div class="bg-content-tag bg-content-glass svelte-1hm6q66"><span class="bg-content-tag-new svelte-1hm6q66">New</span> <span class="svelte-1hm6q66">Just shipped v2.0</span></div> <h2 class="svelte-1hm6q66"> </h2> <div class="bg-content-actions svelte-1hm6q66"><span class="bg-content-primary svelte-1hm6q66">Get started</span> <span class="bg-content-secondary bg-content-glass svelte-1hm6q66">Learn more</span></div></div>`, 1);
var root_1 = $.from_html(`<div class="bg-content-root svelte-1hm6q66" aria-hidden="true"><div class="bg-content-toggle-wrap svelte-1hm6q66"><label class="bg-content-switch-row svelte-1hm6q66"><span>Demo Content</span> <input type="checkbox" class="svelte-1hm6q66"/> <span class="bg-content-switch svelte-1hm6q66" aria-hidden="true"></span></label></div> <!></div>`);

export default function BackgroundContentToggle($$anchor, $$props) {
	$.push($$props, true);

	let headline = $.prop($$props, 'headline', 3, 'Build interfaces that feel alive'),
		showContent = $.prop($$props, 'showContent', 3, true);

	var div = root_1();
	var div_1 = $.child(div);
	var label = $.child(div_1);
	var input = $.sibling($.child(label), 2);

	$.remove_input_defaults(input);
	$.next(2);
	$.reset(label);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var div_2 = $.first_child(fragment);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var img = $.only_child(div_4);

			$.next(4);
			$.reset(div_3);
			$.reset(div_2);

			var div_5 = $.sibling(div_2, 2);
			var h2 = $.sibling($.child(div_5), 2);
			var text = $.only_child(h2, true);

			$.next(2);
			$.reset(div_5);

			$.template_effect(() => {
				$.set_attribute(img, 'src', logo);
				$.set_text(text, headline());
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (showContent()) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_checked(input, showContent()));
	$.delegated('change', input, (e) => $$props.onToggle?.(e.currentTarget.checked));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change']);