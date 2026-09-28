import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { loading } from '$routes/store';
import { app } from '$lib/stores/app';
import { Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<img width="120" height="22" alt="Appwrite Logo"/>`);
var root_1 = $.from_html(`<section class="console-container svelte-18wxjgz"><!></section> <footer class="svelte-18wxjgz"><!> <!></footer>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	loading.set(false);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			height: '100vh',
			direction: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			style: 'background: var(--bgcolor-neutral-primary, #fff);',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var section = $.first_child(fragment_1);
				var node_1 = $.child(section);

				$.slot(node_1, $$props, 'default', {}, null);
				$.reset(section);

				var footer = $.sibling(section, 2);
				var node_2 = $.child(footer);

				$.component(node_2, () => Typography.Eyebrow, ($$anchor, Typography_Eyebrow) => {
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

				var node_3 = $.sibling(node_2, 2);

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

					$.if(node_3, ($$render) => {
						if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(footer);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}