import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from '$lib/components/ui/dialog';
import Item from './Item.svelte';
import Button from '$lib/builder/ui/Button.svelte';
import PageForm from './PageTypeForm.svelte';
import { PageTypes } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';
import { page as pageState } from '$app/state';
import { self } from '$lib/pocketbase/managers';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<li style="background: #1a1a1a;"><!></li>`);
var root_2 = $.from_html(`<!> <main class="grid gap-2 p-2 bg-[var(--primo-color-black)]"><ul class="grid gap-2"><!> <!></ul> <!></main>`, 1);

export default function PageTypeModal($$anchor, $$props) {
	$.push($$props, true);

	// Get site from context (preferred) or fallback to hostname lookup
	const { value: site } = site_context.get();

	async function create_page_type(new_page_type) {
		if (!site) return;

		// Add the site ID to the page type
		const page_type_data = { ...new_page_type, site: site.id };

		PageTypes.create(page_type_data);
		self.commit();
	}

	let creating_page_type = $.state(false);
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Header, ($$anchor, Dialog_Header) => {
		Dialog_Header($$anchor, { title: 'Page Types', icon: 'lucide:layout-template' });
	});

	var main = $.sibling(node, 2);
	var ul = $.child(main);
	var node_1 = $.child(ul);

	$.each(node_1, 17, () => site?.page_types() || [], $.index, ($$anchor, page_type) => {
		var li = root();
		var node_2 = $.child(li);

		{
			let $0 = $.derived(() => pageState.params.page_type === $.get(page_type).id);

			Item(node_2, {
				get page_type() {
					return $.get(page_type);
				},

				get active() {
					return $.get($0);
				}
			});
		}

		$.reset(li);
		$.append($$anchor, li);
	});

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var li_1 = root_1();
			var node_4 = $.child(li_1);

			PageForm(node_4, {
				$$events: {
					create: ({ detail: new_page_type }) => {
						$.set(creating_page_type, false);
						create_page_type(new_page_type);
					}
				}
			});

			$.reset(li_1);
			$.append($$anchor, li_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(creating_page_type)) $$render(consequent);
		});
	}

	$.reset(ul);

	var node_5 = $.sibling(ul, 2);

	{
		let $0 = $.derived(() => $.get(creating_page_type) === true);

		Button(node_5, {
			variants: 'secondary fullwidth',
			get disabled() {
				return $.get($0);
			},
			onclick: () => $.set(creating_page_type, true),
			label: 'Create Page Type',
			icon: 'akar-icons:plus'
		});
	}

	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}