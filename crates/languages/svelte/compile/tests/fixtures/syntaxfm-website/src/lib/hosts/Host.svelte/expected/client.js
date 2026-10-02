import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HostSocialLink from './HostSocialLink.svelte';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<div class="person svelte-nnwa4d"><figure class="svelte-nnwa4d"><img role="presentation" class="svelte-nnwa4d"/> <figcaption class="svelte-nnwa4d"><p class="svelte-nnwa4d"><!> <span class="host-guest-tag fst-900-i grit svelte-nnwa4d"> </span></p> <div class="featuring_socials"><!></div></figcaption></figure></div>`);

export default function Host($$anchor, $$props) {
	$.push($$props, true);

	let guest = $.prop($$props, 'guest', 3, false);
	var div = root_1();
	var figure = $.child(div);
	var img = $.child(figure);
	var figcaption = $.sibling(img, 2);
	var p = $.child(figcaption);
	var node = $.child(p);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var text = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `/guest/${$$props.host.slug}`);
				$.set_text(text, $$props.host.name);
			});

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $$props.host.name));
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if (guest()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var span = $.sibling(node, 2);
	var text_2 = $.only_child(span, true);

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var node_1 = $.child(div_1);

	HostSocialLink(node_1, {
		get host() {
			return $$props.host;
		}
	});

	$.reset(div_1);
	$.reset(figcaption);
	$.reset(figure);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', `https://github.com/${$$props.host.github}.png`);
		$.set_attribute(img, 'alt', $$props.host.name);
		$.set_text(text_2, guest() ? 'Guest' : 'Host');
	});

	$.append($$anchor, div);
	$.pop();
}