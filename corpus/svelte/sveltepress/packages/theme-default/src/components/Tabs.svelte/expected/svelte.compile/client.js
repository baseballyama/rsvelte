import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, tick } from 'svelte';
import { flip } from 'svelte/animate';
import { cubicInOut } from 'svelte/easing';
import { writable } from 'svelte/store';
import { crossfade } from 'svelte/transition';

export const activeNameContextKey = Symbol('activeTab');
export const itemsKey = Symbol('items');

var root = $.from_html(`<div role="tab" tabindex="0"><!> <div> </div></div>`);
var root_1 = $.from_html(`<div class="active-bar svelte-st05z8"></div>`);
var root_2 = $.from_html(`<div class="svp-tab svelte-st05z8"><div class="tab-header svelte-st05z8" style="--bar-op:0;"><!> <!></div> <div><div class="tab-body svelte-st05z8"><!></div></div></div>`);

export default function Tabs($$anchor, $$props) {
	$.push($$props, true);

	const $current = () => $.store_get(current, '$current', $$stores);
	const $items = () => $.store_get(items, '$items', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const items = writable([]);
	let tabContainer = $.state(void 0);
	let itemWidthArray = $.state($.proxy([]));

	/**
	 * @typedef {object} Props
	 * @property {any} activeName - Active tab name
	 * @property {boolean} [bodyPadding] - Whether to add padding to the body
	 * @property {import('svelte').Snippet} [children] - Children content
	 */
	/** @type {Props} */
	const bodyPadding = $.prop($$props, 'bodyPadding', 3, true);

	const current = writable($$props.activeName);

	setContext(activeNameContextKey, current);
	setContext(itemsKey, items);

	function toggleTab(name) {
		$.store_set(current, name);
	}

	const [send, receive] = crossfade({
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 500,
				easing: cubicInOut,
				css: (t) => `
          transform: ${transform};
          opacity: ${t};
        `
			};
		}
	});

	function computedItems() {
		if (!$.get(tabContainer)) return;

		$.set(
			itemWidthArray,
			[...$.get(tabContainer).querySelectorAll('.tab-header-item')].map((item) => ({
				left: item.offsetLeft,
				width: item.offsetWidth,
				name: item.dataset.tabName
			})),
			true
		);
	}

	$.user_effect(() => {
		tick().then(() => computedItems($items()));
	});

	var div = root_2();

	$.event('resize', $.window, computedItems);

	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	$.each(node_1, 1, $items, ({ name, activeIcon, inactiveIcon }) => name, ($$anchor, $$item) => {
		let name = () => $.get($$item).name;
		let activeIcon = () => $.get($$item).activeIcon;
		let inactiveIcon = () => $.get($$item).inactiveIcon;
		const active = $.derived(() => $current() === name());
		var div_2 = root();
		let classes;
		var node_2 = $.child(div_2);

		{
			var consequent_1 = ($$anchor) => {
				var fragment = $.comment();
				var node_3 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						const SvelteComponent = $.derived(activeIcon);
						var fragment_1 = $.comment();
						var node_4 = $.first_child(fragment_1);

						$.component(node_4, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_2) => {
							SvelteComponent_2($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					};

					$.if(node_3, ($$render) => {
						if (activeIcon()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment);
			};

			var consequent_2 = ($$anchor) => {
				const SvelteComponent_1 = $.derived(inactiveIcon);
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.component(node_5, () => $.get(SvelteComponent_1), ($$anchor, SvelteComponent_1_1) => {
					SvelteComponent_1_1($$anchor, {});
				});

				$.append($$anchor, fragment_2);
			};

			$.if(node_2, ($$render) => {
				if ($.get(active)) $$render(consequent_1); else if (inactiveIcon()) $$render(consequent_2, 1);
			});
		}

		var div_3 = $.sibling(node_2, 2);
		let classes_1;
		var text = $.only_child(div_3, true);

		$.reset(div_2);

		$.template_effect(() => {
			classes = $.set_class(div_2, 1, 'tab-header-item svelte-st05z8', null, classes, { active: $.get(active) });
			$.set_attribute(div_2, 'data-tab-name', name());

			classes_1 = $.set_class(div_3, 1, 'svelte-st05z8', null, classes_1, {
				name: $.get(active) && activeIcon() || !$.get(active) && inactiveIcon()
			});

			$.set_text(text, name());
		});

		$.delegated('click', div_2, () => toggleTab(name()));
		$.event('keypress', div_2, () => toggleTab(name()));
		$.append($$anchor, div_2);
	});

	var node_6 = $.sibling(node_1, 2);

	$.each(node_6, 25, () => $.get(itemWidthArray).filter((n) => n.name === $current()), $.index, ($$anchor, $$item, i) => {
		let width = () => $.get($$item).width;
		let left = () => $.get($$item).left;
		var div_4 = root_1();

		$.template_effect(() => $.set_style(div_4, `--bar-width: ${width()}px;--bar-left: ${left()}px;`));
		$.transition(1, div_4, () => receive, () => ({ key: i }));
		$.transition(2, div_4, () => send, () => ({ key: i }));
		$.animation(div_4, () => flip, () => ({ duration: 200, easing: cubicInOut }));
		$.append($$anchor, div_4);
	});

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	let classes_2;
	var div_6 = $.child(div_5);
	var node_7 = $.child(div_6);

	$.snippet(node_7, () => $$props.children ?? $.noop);
	$.reset(div_6);
	$.reset(div_5);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(tabContainer, $$value), () => $.get(tabContainer));
	$.template_effect(() => classes_2 = $.set_class(div_5, 1, 'svelte-st05z8', null, classes_2, { padding: bodyPadding() }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);