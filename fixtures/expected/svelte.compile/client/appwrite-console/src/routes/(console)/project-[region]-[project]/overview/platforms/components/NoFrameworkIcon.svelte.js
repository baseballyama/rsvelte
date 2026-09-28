import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import noFrameworkIcon from './noFrameworkIcon.svg';
import noFrameworkIconDark from './noFrameworkIconDark.svg';
import { app } from '$lib/stores/app';

var root = $.from_html(`<img alt=""/>`);

export default function NoFrameworkIcon($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => $.set_attribute(img, 'src', noFrameworkIcon));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var img_1 = root();

			$.template_effect(() => $.set_attribute(img_1, 'src', noFrameworkIconDark));
			$.append($$anchor, img_1);
		};

		$.if(node, ($$render) => {
			if ($app().themeInUse === 'light') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}