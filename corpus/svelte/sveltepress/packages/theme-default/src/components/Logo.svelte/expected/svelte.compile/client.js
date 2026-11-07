import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import siteConfig from 'virtual:sveltepress/site';
import themeOptions from 'virtual:sveltepress/theme-default';
import NavItem from './NavItem.svelte';
import { getPathFromBase, parseImageSrc } from './utils';

var root = $.from_html(`<img class="logo svelte-jpembn" height="32"/> <span class="title svelte-jpembn"> </span>`, 1);

export default function Logo($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => getPathFromBase('/'));

		NavItem($$anchor, {
			get to() {
				return $.get($0);
			},

			get title() {
				return siteConfig.title;
			},
			brand: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root();
						var img = $.first_child(fragment_2);
						var span = $.sibling(img, 2);
						var text = $.only_child(span, true);

						$.template_effect(
							($0) => {
								$.set_attribute(img, 'src', $0);
								$.set_attribute(img, 'alt', siteConfig.title);
								$.set_text(text, siteConfig.title);
							},
							[() => parseImageSrc(themeOptions.logo)]
						);

						$.append($$anchor, fragment_2);
					};

					$.if(node, ($$render) => {
						if (themeOptions.logo) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}