import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { kanbanCard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'card',
	'isDragging',
	'onDragStart',
	'onDragEnd',
	'classes'
]);

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<article><p> </p> <!> <!></article>`);

export default function KanbanCard($$anchor, $$props) {
	$.push($$props, true);

	let isDragging = $.prop($$props, 'isDragging', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("kanbanCard"));
	const styles = kanbanCard();
	var article = root_3();
	var event_handler = (ev) => $$props.onDragStart?.($$props.card, ev);
	var event_handler_1 = (ev) => $$props.onDragEnd?.(ev);

	$.attribute_effect(
		article,
		($0) => ({
			role: 'listitem',
			draggable: 'true',
			...restProps,
			ondragstart: event_handler,
			ondragend: event_handler_1,
			tabindex: '0',
			'aria-grabbed': isDragging(),
			'aria-label': $$props.card.title,
			class: $0
		}),
		[
			() => styles.card({
				isDragging: isDragging(),
				class: clsx($.get(theme)?.card, $$props.classes?.card)
			})
		]
	);

	var p = $.child(article);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(
				($0) => {
					$.set_class(p_1, 1, $0);
					$.set_text(text_1, $$props.card.description);
				},
				[
					() => $.clsx(styles.cardDescription({
						class: clsx($.get(theme)?.cardDescription, $$props.classes?.cardDescription)
					}))
				]
			);

			$.append($$anchor, p_1);
		};

		$.if(node, ($$render) => {
			if ($$props.card.description) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();

			$.each(div, 21, () => $$props.card.tags, $.index, ($$anchor, tag) => {
				var span = root_1();
				var text_2 = $.only_child(span, true);

				$.template_effect(
					($0) => {
						$.set_class(span, 1, $0);
						$.set_text(text_2, $.get(tag));
					},
					[
						() => $.clsx(styles.cardTag({ class: clsx($.get(theme)?.cardTag, $$props.classes?.cardTag) }))
					]
				);

				$.append($$anchor, span);
			});

			$.reset(div);

			$.template_effect(($0) => $.set_class(div, 1, $0), [
				() => $.clsx(styles.cardTags({
					class: clsx($.get(theme)?.cardTags, $$props.classes?.cardTags)
				}))
			]);

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($$props.card.tags?.length) $$render(consequent_1);
		});
	}

	$.reset(article);

	$.template_effect(
		($0) => {
			$.set_class(p, 1, $0);
			$.set_text(text, $$props.card.title);
		},
		[
			() => $.clsx(styles.cardTitle({
				class: clsx($.get(theme)?.cardTitle, $$props.classes?.cardTitle)
			}))
		]
	);

	$.append($$anchor, article);
	$.pop();
}