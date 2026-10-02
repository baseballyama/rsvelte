import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';

var root = $.from_html(`<img width="120" height="22" alt="Appwrite Logo"/>`);
var root_1 = $.from_html(`<div class="auth-bg svelte-dsikgi"><section class="console-container svelte-dsikgi"><!></section> <footer class="svelte-dsikgi"><!></footer></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var div = root_1();
	var section = $.child(div);
	var node = $.child(section);

	$.snippet(node, () => $$props.children);
	$.reset(section);

	var footer = $.sibling(section, 2);
	var node_1 = $.child(footer);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => $.set_attribute(img, 'src', `${base ?? ''}/images/appwrite-logo-dark.svg`));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var img_1 = root();

			$.template_effect(() => $.set_attribute(img_1, 'src', `${base ?? ''}/images/appwrite-logo-light.svg`));
			$.append($$anchor, img_1);
		};

		$.if(node_1, ($$render) => {
			if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(footer);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}