import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { Button } from '$lib/components/ui/button';

var root = $.from_html(`<!> <span class="h-4 w-24 text-xs text-gray-600"> </span>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4 overflow-x-auto py-2 sm:hidden"></div>`);

export default function Category_list($$anchor, $$props) {
	$.push($$props, true);

	let categories = $.prop($$props, 'categories', 19, () => []);

	function navigateToCategory(slug, link) {
		if (link) {
			goto(`${link}`);
		} else if (slug) {
			goto(`/${slug}`);
		} else {
			goto('/products');
		}
	}

	var div = root_1();

	$.each(div, 21, () => categories().filter((category) => category.parentCategoryId === null), ({ slug, icon, color, name, link, thumbnail }) => slug, ($$anchor, $$item) => {
		let slug = () => $.get($$item).slug;
		let icon = () => $.get($$item).icon;
		let color = () => $.get($$item).color;
		let name = () => $.get($$item).name;
		let link = () => $.get($$item).link;
		let thumbnail = () => $.get($$item).thumbnail;

		Button($$anchor, {
			variant: 'plain',
			onclick: () => navigateToCategory(slug(), link()),
			class: 'flex flex-col items-center gap-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				LazyImg(node, {
					get src() {
						return thumbnail();
					},

					get alt() {
						return `Shop ${name() ?? ''} category`;
					},
					class: 'overflow-hidden truncate rounded-full',
					width: '72',
					height: '72'
				});

				var span = $.sibling(node, 2);
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, name()));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}