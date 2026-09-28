import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { CATEGORIES, NEW, UPDATED, slug, isImplemented } from '$lib/constants/categories';
import { onMount } from 'svelte';
import { getSavedComponents } from '$lib/utils/favorites';

var root = $.from_svg(`<svg class="favorite-sidebar-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path></svg>`);
var root_1 = $.from_html(`<span class="help-tag">Help</span>`);
var root_2 = $.from_html(`<span class="new-tag">New</span>`);
var root_3 = $.from_html(`<span class="updated-tag">Updated</span>`);
var root_4 = $.from_html(`<a><span> </span> <!> <!></a>`);
var root_5 = $.from_html(`<div><p class="category-name"> </p> <div class="sidebar-stack" role="list"></div></div>`);
var root_6 = $.from_html(`<aside class="sidebar" aria-label="Docs navigation"><div class="sidebar-inner"><div class="sidebar-cat-list"></div></div></aside>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let scrollEl = $.state(null);
	let savedSet = $.state($.proxy(new Set()));
	const activeCategory = $.derived(() => page.params.category ?? '');
	const activeSub = $.derived(() => page.params.subcategory ?? '');

	function isActive(cat, sub) {
		return slug(cat) === $.get(activeCategory) && slug(sub) === $.get(activeSub);
	}

	function loadSaved() {
		$.set(savedSet, new Set(getSavedComponents()), true);
	}

	onMount(() => {
		loadSaved();

		const onStorage = (e) => {
			if (!e.key || e.key === 'savedComponents') loadSaved();
		};

		window.addEventListener('favorites:updated', loadSaved);
		window.addEventListener('storage', onStorage);

		return () => {
			window.removeEventListener('favorites:updated', loadSaved);
			window.removeEventListener('storage', onStorage);
		};
	});

	var aside = root_6();
	var div = $.child(aside);
	var div_1 = $.child(div);

	$.each(div_1, 21, () => CATEGORIES, (cat) => cat.name, ($$anchor, cat) => {
		var div_2 = root_5();
		var p = $.child(div_2);
		var text = $.only_child(p, true);
		var div_3 = $.sibling(p, 2);

		$.each(div_3, 20, () => $.get(cat).subcategories, (sub) => sub, ($$anchor, sub) => {
			const implemented = $.derived(() => isImplemented(sub));
			const favoriteKey = $.derived(() => `${$.get(cat).name}/${sub}`);
			var a = root_4();
			var span = $.child(a);
			var text_1 = $.only_child(span, true);
			var node = $.sibling(span, 2);

			{
				var consequent = ($$anchor) => {
					var svg = root();

					$.append($$anchor, svg);
				};

				var d = $.derived(() => $.get(savedSet).has($.get(favoriteKey)));

				$.if(node, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span_1 = root_1();

					$.append($$anchor, span_1);
				};

				var consequent_2 = ($$anchor) => {
					var span_2 = root_2();

					$.append($$anchor, span_2);
				};

				var d_1 = $.derived(() => NEW.includes(sub));

				var consequent_3 = ($$anchor) => {
					var span_3 = root_3();

					$.append($$anchor, span_3);
				};

				var d_2 = $.derived(() => UPDATED.includes(sub));

				$.if(node_1, ($$render) => {
					if (!$.get(implemented)) $$render(consequent_1); else if ($.get(d_1)) $$render(consequent_2, 1); else if ($.get(d_2)) $$render(consequent_3, 2);
				});
			}

			$.reset(a);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_class(a, 1, `sidebar-item ${$0 ?? ''} ${$.get(implemented) ? '' : 'unimplemented'}`);
					$.set_attribute(a, 'href', `/${$1 ?? ''}/${$2 ?? ''}`);
					$.set_attribute(a, 'aria-current', $3);
					$.set_text(text_1, sub);
				},
				[
					() => isActive($.get(cat).name, sub) ? 'active' : '',
					() => slug($.get(cat).name),
					() => slug(sub),
					() => isActive($.get(cat).name, sub) ? 'page' : undefined
				]
			);

			$.delegated('click', a, () => $$props.onnavigate?.());
			$.append($$anchor, a);
		});

		$.reset(div_3);
		$.reset(div_2);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(p, 'id', `sidebar-${$0 ?? ''}`);
				$.set_text(text, $.get(cat).name);
				$.set_attribute(div_3, 'aria-labelledby', `sidebar-${$1 ?? ''}`);
			},
			[() => slug($.get(cat).name), () => slug($.get(cat).name)]
		);

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(aside);
	$.bind_this(aside, ($$value) => $.set(scrollEl, $$value), () => $.get(scrollEl));
	$.append($$anchor, aside);
	$.pop();
}

$.delegate(['click']);