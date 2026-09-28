import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import Icon from '@iconify/svelte';
import { get, set } from 'idb-keyval';
import * as Avatar from '$lib/components/ui/avatar/index.js';

var root = $.from_html(`<span class="title svelte-4b7mq8"> </span>`);
var root_1 = $.from_html(`<span class="pill svelte-4b7mq8"> </span>`);

var root_2 = $.from_html(`<button class="header-button svelte-4b7mq8"><header class="svelte-4b7mq8"><div style="display: flex;
				align-items: center;
				gap: 0.5rem;"><!> <!> <!></div> <!></header></button>`);

var root_3 = $.from_html(`<div class="card-body svelte-4b7mq8"><!> <!></div>`);
var root_4 = $.from_html(`<div><div><!> <!> <!></div></div>`);

export default function Card($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {Object} Props
	 * @property {any} [id]
	 * @property {any} [title]
	 * @property {boolean} [minimal]
	 * @property {string} [icon]
	 * @property {any} [pill]
	 * @property {import('svelte').Snippet} [body]
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('svelte').Snippet<[any]>} [footer]
	 */
	/** @type {Props} */
	let id = $.prop($$props, 'id', 3, null),
		title = $.prop($$props, 'title', 3, null),
		minimal = $.prop($$props, 'minimal', 3, false),
		icon = $.prop($$props, 'icon', 3, ''),
		pill = $.prop($$props, 'pill', 3, null);

	let hidden = $.state(false);

	$.user_pre_effect(() => {
		if (title()) get(title()).then((res) => {
			if (res !== undefined) {
				$.set(hidden, res, true);
			}
		});
	});

	onDestroy(() => {
		if (title()) {
			set(title(), $.get(hidden));
		}
	});

	var div = root_4();
	let classes;
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_4 = ($$anchor) => {
			var button = root_2();
			var header = $.child(button);
			var div_2 = $.child(header);
			var node_1 = $.child(div_2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text = $.only_child(span, true);

					$.template_effect(() => $.set_text(text, title()));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if (title()) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return icon();
						}
					});
				};

				$.if(node_2, ($$render) => {
					if (icon()) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root_1();
					var text_1 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_1, pill()));
					$.append($$anchor, span_1);
				};

				$.if(node_3, ($$render) => {
					if (pill()) $$render(consequent_2);
				});
			}

			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					Icon($$anchor, { icon: 'ph:caret-down-bold' });
				};

				var alternate = ($$anchor) => {
					Icon($$anchor, { icon: 'ph:caret-up-bold' });
				};

				$.if(node_4, ($$render) => {
					if ($.get(hidden)) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.reset(header);
			$.reset(button);

			$.delegated('click', button, () => {
				$.set(hidden, !$.get(hidden));
			});

			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (title()) $$render(consequent_4);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_3();
			var node_6 = $.child(div_3);

			$.snippet(node_6, () => $$props.body ?? $.noop);

			var node_7 = $.sibling(node_6, 2);

			$.snippet(node_7, () => $$props.children ?? $.noop);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_5, ($$render) => {
			if (!$.get(hidden)) $$render(consequent_5);
		});
	}

	var node_8 = $.sibling(node_5, 2);

	$.snippet(node_8, () => $$props.footer ?? $.noop, () => ({ class: 'card-footer' }));
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'Card svelte-4b7mq8', null, classes, { minimal: minimal() });
		$.set_attribute(div, 'id', id());
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);