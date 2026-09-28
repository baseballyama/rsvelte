import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import UI from '../../ui';
import { mod_key_held } from '../../stores/app/misc';

var root = $.from_html(`<div></div> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <span> </span>`, 1);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<span class="key-hint svelte-1kqoqrl" aria-hidden=""> </span>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<span> </span>`);
var root_6 = $.from_html(`<button><!></button>`);

export default function ToolbarButton($$anchor, $$props) {
	$.push($$props, true);

	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {any} [id]
	 * @property {string} [title]
	 * @property {string | null} [label]
	 * @property {any} [key]
	 * @property {any} [icon]
	 * @property {any} [svg]
	 * @property {boolean} [disabled]
	 * @property {any} [onclick]
	 * @property {boolean} [loading]
	 * @property {boolean} [active]
	 * @property {any} [buttons]
	 * @property {any} [type]
	 * @property {string} [style]
	 * @property {import('svelte').Snippet} [children]
	 */
	/** @type {Props} */
	let id = $.prop($$props, 'id', 3, null),
		title = $.prop($$props, 'title', 3, ''),
		label = $.prop($$props, 'label', 3, null),
		key = $.prop($$props, 'key', 3, null),
		icon = $.prop($$props, 'icon', 3, null),
		svg = $.prop($$props, 'svg', 3, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		onclick = $.prop($$props, 'onclick', 3, null),
		loading = $.prop($$props, 'loading', 3, false),
		active = $.prop($$props, 'active', 3, false),
		buttons = $.prop($$props, 'buttons', 3, null),
		type = $.prop($$props, 'type', 3, null),
		style = $.prop($$props, 'style', 3, '');

	let subButtonsActive = $.state(false);
	var button = root_6();
	let classes;
	var node = $.child(button);

	{
		var consequent_6 = ($$anchor) => {
			var fragment = root_4();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => UI.Spinner, ($$anchor, UI_Spinner) => {
						UI_Spinner($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				};

				var consequent_1 = ($$anchor) => {
					var fragment_2 = root();
					var div = $.first_child(fragment_2);
					let classes_1;

					$.html(div, svg, true);
					$.reset(div);

					var span = $.sibling(div, 2);
					let classes_2;
					var text = $.only_child(span, true);

					$.template_effect(() => {
						classes_1 = $.set_class(div, 1, 'svg', null, classes_1, { invisible: key() && $mod_key_held() });
						classes_2 = $.set_class(span, 1, 'label', null, classes_2, { invisible: key() && $mod_key_held() });
						$.set_text(text, label());
					});

					$.append($$anchor, fragment_2);
				};

				var consequent_2 = ($$anchor) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					{
						let $0 = $.derived(() => key() && $mod_key_held() ? 'invisible' : '');

						Icon(node_3, {
							get icon() {
								return icon();
							},

							get class() {
								return $.get($0);
							}
						});
					}

					var span_1 = $.sibling(node_3, 2);
					let classes_3;
					var text_1 = $.only_child(span_1, true);

					$.template_effect(() => {
						classes_3 = $.set_class(span_1, 1, 'label', null, classes_3, { invisible: key() && $mod_key_held() });
						$.set_text(text_1, label());
					});

					$.append($$anchor, fragment_3);
				};

				var consequent_3 = ($$anchor) => {
					var div_1 = root_2();
					let classes_4;

					$.html(div_1, svg, true);
					$.reset(div_1);
					$.template_effect(() => classes_4 = $.set_class(div_1, 1, 'svg', null, classes_4, { invisible: key() && $mod_key_held() }));
					$.append($$anchor, div_1);
				};

				var consequent_4 = ($$anchor) => {
					{
						let $0 = $.derived(() => key() && $mod_key_held() ? 'invisible' : '');

						Icon($$anchor, {
							get icon() {
								return icon();
							},

							get class() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if (loading()) $$render(consequent); else if (label() && svg()) $$render(consequent_1, 1); else if (label() && icon()) $$render(consequent_2, 2); else if (svg()) $$render(consequent_3, 3); else if (icon()) $$render(consequent_4, 4);
				});
			}

			var node_4 = $.sibling(node_1, 2);

			{
				var consequent_5 = ($$anchor) => {
					var span_2 = root_3();
					var text_2 = $.only_child(span_2);

					$.template_effect(($0) => $.set_text(text_2, `⌘${$0 ?? ''}`), [() => key().toUpperCase()]);
					$.append($$anchor, span_2);
				};

				$.if(node_4, ($$render) => {
					if (key() && $mod_key_held() && !loading()) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment);
		};

		var consequent_7 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_5 = $.first_child(fragment_5);

			$.snippet(node_5, () => $$props.children);
			$.append($$anchor, fragment_5);
		};

		var alternate = ($$anchor) => {
			var span_3 = root_5();
			var text_3 = $.only_child(span_3, true);

			$.template_effect(() => $.set_text(text_3, label()));
			$.append($$anchor, span_3);
		};

		$.if(node, ($$render) => {
			if (icon() || svg()) $$render(consequent_6); else if ($$props.children) $$render(consequent_7, 1); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'id', id());
		$.set_attribute(button, 'aria-label', title());

		classes = $.set_class(button, 1, 'primo-button svelte-1kqoqrl', null, classes, {
			primo: type() === 'primo',
			active: active(),
			'has-subbuttons': buttons(),
			'has-icon-button': !label() && icon()
		});

		$.set_style(button, style());
		button.disabled = disabled();
	});

	$.delegated('click', button, () => {
		$.set(subButtonsActive, !$.get(subButtonsActive));
		onclick() ? onclick()() : dispatch('click');
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);