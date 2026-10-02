import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { kanbanBoard } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import KanbanCard from "./KanbanCard.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'columns',
	'onMove',
	'onAddCard',
	'cardProps',
	'class',
	'classes'
]);

var root = $.from_html(`<div role="group"><h2> </h2> <div role="list"></div> <button>+ Add card</button></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function KanbanBoard($$anchor, $$props) {
	$.push($$props, true);

	let columns = $.prop($$props, 'columns', 27, () => $.proxy([])),
		onMove = $.prop($$props, 'onMove', 3, (_card, _from, _to) => {}),
		onAddCard = $.prop($$props, 'onAddCard', 3, (_col) => {}),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("kanbanBoard"));

	// Changed from KanbanCard to KanbanCardType
	let draggedCard = $.state(null);

	let sourceColumnId = $.state(null);
	let dragOverColumnId = $.state(null);
	const styles = kanbanBoard();

	// Changed parameter type from KanbanCard to KanbanCardType
	function handleDragStart(card, colId) {
		$.set(draggedCard, card, true);
		$.set(sourceColumnId, colId, true);
	}

	function handleDragOver(e, colId) {
		e.preventDefault();
		$.set(dragOverColumnId, colId, true);
	}

	function handleDragLeave(e) {
		const currentTarget = e.currentTarget;
		const relatedTarget = e.relatedTarget;

		if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
			$.set(dragOverColumnId, null);
		}
	}

	function handleDrop(e, targetColId) {
		e.preventDefault();
		$.set(dragOverColumnId, null);

		if ($.get(draggedCard) === null || $.get(sourceColumnId) === null) return;

		if ($.get(sourceColumnId) === targetColId) {
			$.set(draggedCard, null);
			$.set(sourceColumnId, null);

			return;
		}

		const fromCol = columns().find((c) => c.id === $.get(sourceColumnId));
		const toCol = columns().find((c) => c.id === targetColId);

		if (!fromCol || !toCol) return;

		fromCol.cards = fromCol.cards.filter((c) => c.id !== $.get(draggedCard).id);
		toCol.cards = [...toCol.cards, $.get(draggedCard)];
		onMove()($.get(draggedCard), fromCol, toCol);
		$.set(draggedCard, null);
		$.set(sourceColumnId, null);
	}

	function handleDragEnd() {
		$.set(draggedCard, null);
		$.set(sourceColumnId, null);
		$.set(dragOverColumnId, null);
	}

	var div = root_1();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => styles.container({ class: clsx($.get(theme)?.container, $$props.class) })
	]);

	$.each(div, 21, columns, (col) => col.id, ($$anchor, col) => {
		var div_1 = root();
		var h2 = $.child(div_1);
		var text = $.only_child(h2, true);
		var div_2 = $.sibling(h2, 2);

		$.each(div_2, 21, () => $.get(col).cards, (card) => card.id, ($$anchor, card) => {
			{
				let $0 = $.derived(() => $.get(draggedCard)?.id === $.get(card).id);

				KanbanCard($$anchor, $.spread_props(
					{
						get card() {
							return $.get(card);
						},

						get classes() {
							return $$props.classes;
						}
					},
					() => $$props.cardProps,
					{
						get isDragging() {
							return $.get($0);
						},
						onDragStart: () => handleDragStart($.get(card), $.get(col).id),
						onDragEnd: handleDragEnd
					}
				));
			}
		});

		$.reset(div_2);

		var button = $.sibling(div_2, 2);

		$.reset(div_1);

		$.template_effect(
			($0, $1, $2, $3) => {
				$.set_attribute(div_1, 'aria-label', `${$.get(col).title} column drop zone`);
				$.set_class(div_1, 1, $0);
				$.set_style(div_1, $.get(col).color ? `border-top: 4px solid ${$.get(col).color}` : "");
				$.set_class(h2, 1, $1);
				$.set_text(text, $.get(col).title);
				$.set_class(div_2, 1, $2);
				$.set_attribute(div_2, 'aria-label', `${$.get(col).title} cards`);
				$.set_class(button, 1, $3);
				$.set_attribute(button, 'aria-label', `Add card to ${$.get(col).title}`);
			},
			[
				() => $.clsx(styles.column({
					isDragOver: $.get(dragOverColumnId) === $.get(col).id,
					class: clsx($.get(theme)?.column, $$props.classes?.column)
				})),

				() => $.clsx(styles.columnTitle({
					class: clsx($.get(theme)?.columnTitle, $$props.classes?.columnTitle)
				})),

				() => $.clsx(styles.cardList({
					class: clsx($.get(theme)?.cardList, $$props.classes?.cardList)
				})),

				() => $.clsx(styles.addButton({
					class: clsx($.get(theme)?.addButton, $$props.classes?.addButton)
				}))
			]
		);

		$.event('dragover', div_1, (e) => handleDragOver(e, $.get(col).id));
		$.event('dragleave', div_1, (e) => handleDragLeave(e));
		$.event('drop', div_1, (e) => handleDrop(e, $.get(col).id));
		$.delegated('click', button, () => onAddCard()($.get(col)));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);