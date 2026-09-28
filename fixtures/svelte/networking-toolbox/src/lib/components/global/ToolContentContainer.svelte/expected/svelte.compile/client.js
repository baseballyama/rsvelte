import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';
import Icon from '$lib/components/global/Icon.svelte';
import { bookmarks } from '$lib/stores/bookmarks';
import { findToolByHref } from '$lib/utils/nav-helpers';
import { tooltip } from '$lib/actions/tooltip';

var root = $.from_html(`<div class="bookmark-icon bookmark-icon-hover svelte-zg8wei"><!></div>`);
var root_1 = $.from_html(`<button><div class="bookmark-icon svelte-zg8wei"><!></div> <!></button>`);
var root_2 = $.from_html(`<div class="header-controls svelte-zg8wei"><!></div>`);
var root_3 = $.from_html(`<div><!></div>`);
var root_4 = $.from_html(`<div class="card svelte-zg8wei" role="region"><header class="card-header svelte-zg8wei"><div class="header-content svelte-zg8wei"><div class="title-row svelte-zg8wei"><h1 class="svelte-zg8wei"> </h1> <!></div> <p class="svelte-zg8wei"> </p></div> <!></header> <!></div>`);

export default function ToolContentContainer($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const $bookmarks = () => $.store_get(bookmarks, '$bookmarks', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let selectedNav = $.prop($$props, 'selectedNav', 15),
		propHideLabels = $.prop($$props, 'hideLabels', 3, false);

	let hideLabels = $.state(false);

	function updateHideLabels() {
		$.set(hideLabels, propHideLabels() || window.innerWidth < 768, true);
	}

	const currentPath = $.derived(() => $page().url.pathname);
	const currentTool = $.derived(() => findToolByHref($.get(currentPath)));

	const isBookmarked = $.derived(() => $.get(currentTool)
		? bookmarks.isBookmarked($.get(currentTool).href, $bookmarks())
		: false);

	const tooltipText = $.derived(() => $.get(currentTool)
		? $.get(isBookmarked)
			? `Remove ${$.get(currentTool).label} from bookmarks`
			: `Bookmark ${$.get(currentTool).label} for quick access and offline use`
		: '');

	onMount(() => {
		updateHideLabels();
		window.addEventListener('resize', updateHideLabels);
		bookmarks.init();

		return () => window.removeEventListener('resize', updateHideLabels);
	});

	function toggleBookmark(e) {
		e.preventDefault();
		e.stopPropagation();

		if (!$.get(currentTool)) return;

		const bookmarkedTool = {
			href: $.get(currentTool).href,
			label: $.get(currentTool).label,
			description: $.get(currentTool).description || '',
			icon: $.get(currentTool).icon || 'default'
		};

		bookmarks.toggle(bookmarkedTool);
	}

	var div = root_4();
	var header = $.child(div);
	var div_1 = $.child(header);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var button = root_1();
			let classes;
			var div_3 = $.child(button);
			var node_1 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, { name: 'bookmarks', size: 'sm' });
				};

				var alternate = ($$anchor) => {
					Icon($$anchor, { name: 'bookmark-add', size: 'md' });
				};

				$.if(node_1, ($$render) => {
					if ($.get(isBookmarked)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_3);

			var node_2 = $.sibling(div_3, 2);

			{
				var consequent_1 = ($$anchor) => {
					var div_4 = root();
					var node_3 = $.child(div_4);

					Icon(node_3, { name: 'bookmark-remove', size: 'sm' });
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				$.if(node_2, ($$render) => {
					if ($.get(isBookmarked)) $$render(consequent_1);
				});
			}

			$.reset(button);
			$.action(button, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => ({ text: $.get(tooltipText) }));

			$.template_effect(() => {
				classes = $.set_class(button, 1, 'bookmark-btn svelte-zg8wei', null, classes, { bookmarked: $.get(isBookmarked) });
				$.set_attribute(button, 'aria-label', $.get(isBookmarked) ? 'Remove bookmark' : 'Add bookmark');
			});

			$.delegated('click', button, toggleBookmark);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(currentTool)) $$render(consequent_2);
		});
	}

	$.reset(div_2);

	var p = $.sibling(div_2, 2);
	var text_1 = $.only_child(p, true);

	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_5 = root_2();
			var node_5 = $.child(div_5);

			SegmentedControl(node_5, {
				get options() {
					return $$props.navOptions;
				},

				get onchange() {
					return $$props.onNavChange;
				},

				get hideLabel() {
					return $.get(hideLabels);
				},

				get value() {
					return selectedNav();
				},

				set value($$value) {
					selectedNav($$value);
				}
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if ($$props.navOptions && selectedNav() !== undefined) $$render(consequent_3);
		});
	}

	$.reset(header);

	var node_6 = $.sibling(header, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_6 = root_3();
			var node_7 = $.child(div_6);

			$.snippet(node_7, () => $$props.children);
			$.reset(div_6);
			$.template_effect(() => $.set_class(div_6, 1, $.clsx($$props.contentClass), 'svelte-zg8wei'));
			$.append($$anchor, div_6);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_8 = $.first_child(fragment_2);

			$.snippet(node_8, () => $$props.children);
			$.append($$anchor, fragment_2);
		};

		$.if(node_6, ($$render) => {
			if ($$props.contentClass) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		$.set_text(text_1, $$props.description);
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);