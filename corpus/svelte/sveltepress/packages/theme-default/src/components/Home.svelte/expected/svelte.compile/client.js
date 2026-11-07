import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ActionButton from './ActionButton.svelte';
import Feature from './home/Feature.svelte';

var root = $.from_html(`<div class="tagline svelte-n8u4in"> </div>`);
var root_1 = $.from_html(`<div class="home-page svelte-n8u4in"><div class="title svelte-n8u4in"><div class="intro svelte-n8u4in"><h1 class="gradient-title svelte-n8u4in"> </h1> <div class="description svelte-n8u4in"> </div> <!></div> <!></div> <div class="actions svelte-n8u4in"></div> <div class="features svelte-n8u4in"></div></div> <!>`, 1);

export default function Home($$anchor, $$props) {
	$.push($$props, true);

	const features = $.prop($$props, 'features', 19, () => []),
		actions = $.prop($$props, 'actions', 19, () => []),
		tagline = $.prop($$props, 'tagline', 3, '');

	var fragment = root_1();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var div_3 = $.sibling(h1, 2);
	var text_1 = $.only_child(div_3, true);
	var node = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var text_2 = $.only_child(div_4, true);

			$.template_effect(() => $.set_text(text_2, tagline()));
			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if (tagline()) $$render(consequent);
		});
	}

	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.heroImage);
			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($$props.heroImage) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);

	$.each(div_5, 21, actions, $.index, ($$anchor, action) => {
		ActionButton($$anchor, $.spread_props(() => $.get(action)));
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);

	$.each(div_6, 21, features, $.index, ($$anchor, fe, i) => {
		Feature($$anchor, $.spread_props(() => $.get(fe), { i }));
	});

	$.reset(div_6);
	$.reset(div);

	var node_3 = $.sibling(div, 2);

	$.snippet(node_3, () => $$props.children ?? $.noop);

	$.template_effect(() => {
		$.set_text(text, $$props.siteConfig.title);
		$.set_text(text_1, $$props.siteConfig.description);
	});

	$.append($$anchor, fragment);
	$.pop();
}