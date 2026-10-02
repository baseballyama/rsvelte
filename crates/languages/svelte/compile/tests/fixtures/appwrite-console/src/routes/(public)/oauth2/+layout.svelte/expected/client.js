import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';
import { loading } from '$routes/store';
import { Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<img width="120" height="22" alt="Appwrite Logo"/>`);
var root_1 = $.from_html(`<div class="auth-bg svelte-3xznwo"><section class="svelte-3xznwo"><div class="oauth2-shell svelte-3xznwo"><!></div></section> <footer class="svelte-3xznwo"><!> <!></footer></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	loading.set(false);

	var div = root_1();
	var section = $.child(div);
	var div_1 = $.child(section);
	var node = $.child(div_1);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div_1);
	$.reset(section);

	var footer = $.sibling(section, 2);
	var node_1 = $.child(footer);

	$.component(node_1, () => Typography.Eyebrow, ($$anchor, Typography_Eyebrow) => {
		Typography_Eyebrow($$anchor, {
			color: '--fgcolor-neutral-secondary',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('POWERED BY');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

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

		$.if(node_2, ($$render) => {
			if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(footer);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}