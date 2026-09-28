import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import UI from '../../../ui';
import Icon from '@iconify/svelte';
import { validate_url } from '../../../utilities';
import { Page } from '$lib/common/models/Page';
import { page } from '$app/state';
import { Sites, PageTypes, Pages } from '$lib/pocketbase/collections';
import { site_context } from '$lib/builder/stores/context';

var root = $.from_html(`<form><!> <!> <!> <button class="svelte-ekl2j1"><!></button></form>`);

export default function PageForm($$anchor, $$props) {
	$.push($$props, true);

	const { value: site } = site_context.get();
	const page_types = $.derived(() => site?.page_types());

	// set page type equal to the last type used under this parent
	const default_page_type_id = $.derived(() => $$props.parent?.children()?.[0]?.page_type ?? site?.page_types()?.[0]?.id ?? '');

	let new_page = $.state($.proxy({ name: '', slug: '', page_type: '' }));

	$.user_pre_effect(() => {
		$.set(new_page, { name: '', slug: '', page_type: $.get(default_page_type_id) }, true);
	});

	let page_creation_disabled = $.derived(() => !$.get(new_page).name || !$.get(new_page).slug);
	let page_label_edited = $.state(false);

	$.user_effect(() => {
		$.get(new_page).slug = $.get(page_label_edited)
			? validate_url($.get(new_page).slug)
			: validate_url($.get(new_page).name);
	});

	var form = root();
	let classes;
	var node = $.child(form);

	$.component(node, () => UI.TextInput, ($$anchor, UI_TextInput) => {
		UI_TextInput($$anchor, {
			autofocus: true,
			id: 'page-label',
			label: 'Page Name',
			placeholder: 'About Us',
			get value() {
				return $.get(new_page).name;
			},

			set value($$value) {
				$.get(new_page).name = $$value;
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => UI.TextInput, ($$anchor, UI_TextInput_1) => {
		UI_TextInput_1($$anchor, {
			id: 'page-slug',
			label: 'Page Slug',
			oninput: () => $.set(page_label_edited, true),
			placeholder: 'about-us',
			get value() {
				return $.get(new_page).slug;
			},

			set value($$value) {
				$.get(new_page).slug = $$value;
			}
		});
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_3 = $.first_child(fragment);

			{
				let $0 = $.derived(() => $.get(page_types)?.map((p) => ({ value: p.id, icon: p.icon, label: p.name })));

				$.component(node_3, () => UI.Select, ($$anchor, UI_Select) => {
					UI_Select($$anchor, {
						fullwidth: true,
						label: 'Page Type',
						get value() {
							return $.get(new_page).page_type;
						},

						get options() {
							return $.get($0);
						},

						$$events: {
							input: ({ detail: page_type_id }) => $.get(new_page).page_type = page_type_id
						}
					});
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if ($.get(page_types) && $.get(page_types).length > 1) $$render(consequent);
		});
	}

	var button = $.sibling(node_2, 2);
	var node_4 = $.child(button);

	Icon(node_4, { icon: 'akar-icons:check' });
	$.reset(button);
	$.reset(form);

	$.template_effect(() => {
		classes = $.set_class(form, 1, 'svelte-ekl2j1', null, classes, {
			'has-page-types': $.get(page_types) && $.get(page_types).length > 1
		});

		button.disabled = $.get(page_creation_disabled);
	});

	$.event('submit', form, async (e) => {
		e.preventDefault();
		await $$props.oncreate($.get(new_page));
	});

	$.transition(1, form, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, form);
	$.pop();
}