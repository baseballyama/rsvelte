import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import { onMount } from 'svelte';
import Icon from '@iconify/svelte';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import pluralize from 'pluralize';
import EntryContent from '../components/Fields/EntryContent.svelte';
import { useEntries } from '$lib/Content.svelte';
import { mod_key_held } from '../stores/app/misc';
import { site_context } from '../stores/context';

var root = $.from_html(`<img class="svelte-1hwtezn"/>`);
var root_1 = $.from_html(`<div style="font-size:1.5rem;"></div>`);
var root_2 = $.from_html(`<span style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;min-height: 19px;"> </span>`);
var root_3 = $.from_html(`<span class="key-hint svelte-1hwtezn"><span>&#8984;</span> <!></span>`);
var root_4 = $.from_html(`<div class="repeater-item-field svelte-1hwtezn"><!></div>`);
var root_5 = $.from_html(`<div class="field-values svelte-1hwtezn"></div>`);
var root_6 = $.from_html(`<div><div class="repeater-item-container svelte-1hwtezn"><div class="item-options svelte-1hwtezn"><button class="title svelte-1hwtezn"><!> <!></button> <div class="primo-buttons svelte-1hwtezn"><button class="svelte-1hwtezn"><!></button></div></div> <!></div></div>`);

export default function RepeaterFieldItem($$anchor, $$props) {
	$.push($$props, true);

	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dispatch = createEventDispatcher();

	function get_image(subfields) {
		const [first_subfield] = subfields;

		if (first_subfield && first_subfield.type === 'image') {
			const [ent] = useEntries($$props.entity, first_subfield, $$props.entry) ?? [];

			return ent?.value?.url;
		} else return null;
	}

	function get_icon(subfields) {
		const [first_subfield] = subfields;

		if (first_subfield && first_subfield.type === 'icon') {
			const [ent] = useEntries($$props.entity, first_subfield, $$props.entry) ?? [];

			return ent?.value;
		} else return null;
	}

	function get_title(subfields) {
		const first_subfield = subfields.find((subfield) => ['text', 'markdown', 'link', 'number', 'page'].includes(subfield.type));

		if (first_subfield) {
			const [ent] = useEntries($$props.entity, first_subfield, $$props.entry) ?? [];

			if (first_subfield.type === 'link') return ent?.value?.label; else if (first_subfield.type === 'page') {
				const page = site_context.get().value?.pages()?.find((p) => p.id === ent?.value);

				return page?.name;
			} else return ent?.value;
		} else {
			return $.get(singular_label);
		}
	}

	// let drag_handle_element = $state()
	let element = $.state(void 0);

	// onMount(async () => {
	// 	draggable({
	// 		element,
	// 		dragHandle: drag_handle_element,
	// 		getInitialData: () => ({})
	// 	})
	// 	dropTargetForElements({
	// 		element,
	// 		getData({ input, element }) {
	// 			return attachClosestEdge(
	// 				{},
	// 				{
	// 					element,
	// 					input,
	// 					allowedEdges: ['top', 'bottom']
	// 				}
	// 			)
	// 		},
	// 		onDrag({ self, source }) {
	// 			dispatch('hover', extractClosestEdge(self.data))
	// 		},
	// 		onDragLeave() {
	// 			dispatch('hover', null)
	// 		},
	// 		onDrop({ self, source }) {
	// 			const item_dragged_over = self.data.item
	// 			const item_being_dragged = source.data.item
	// 			const closestEdgeOfTarget = extractClosestEdge(self.data)
	// 			// if (item_dragged_over.index === 0) return // can't place above home
	// 			if (closestEdgeOfTarget === 'top') {
	// 				// actions.rearrange(item_being_dragged, item_dragged_over.index)
	// 				dispatch('move', { item: item_being_dragged, new_index: item_dragged_over.index })
	// 			} else if (closestEdgeOfTarget === 'bottom') {
	// 				dispatch('move', { item: item_being_dragged, new_index: item_dragged_over.index + 1 })
	// 				// actions.rearrange(item_being_dragged, item_dragged_over.index + 1)
	// 			}
	// 			dispatch('hover', null)
	// 		}
	// 	})
	// })
	let singular_label = $.derived(() => pluralize.singular($$props.field.label));

	let item_image = $.derived(() => get_image($$props.subfields));
	let item_icon = $.derived(() => get_icon($$props.subfields));
	let item_title = $.derived(() => get_title($$props.subfields));
	var div = root_6();
	let classes;
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var button = $.child(div_2);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(item_image));
				$.set_attribute(img, 'alt', $.get(item_title) || `Preview for item ${$$props.index} in ${$$props.field.label}`);
			});

			$.append($$anchor, img);
		};

		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();

			$.html(div_3, () => $.get(item_icon), true);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var alternate = ($$anchor) => {
			var span = root_2();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $.get(item_title)));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(item_image)) $$render(consequent); else if ($.get(item_icon)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_1 = root_3();
			var node_2 = $.sibling($.child(span_1), 2);

			Icon(node_2, { icon: 'fa6-solid:hand-pointer' });
			$.reset(span_1);
			$.append($$anchor, span_1);
		};

		var alternate_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => $$props.is_visible ? 'ph:caret-up-bold' : 'ph:caret-down-bold');

				Icon($$anchor, {
					get icon() {
						return $.get($0);
					}
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($mod_key_held()) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.reset(button);

	var div_4 = $.sibling(button, 2);
	var button_1 = $.child(div_4);
	var node_3 = $.child(button_1);

	Icon(node_3, { icon: 'ion:trash' });
	$.reset(button_1);
	$.reset(div_4);
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_5 = root_5();

			$.each(div_5, 21, () => $$props.subfields, (subfield) => subfield.key, ($$anchor, subfield) => {
				var div_6 = root_4();
				var node_5 = $.child(div_6);

				{
					let $0 = $.derived(() => $$props.level + 1);

					EntryContent(node_5, {
						get entity() {
							return $$props.entity;
						},

						get parent() {
							return $$props.entry;
						},

						get field() {
							return $.get(subfield);
						},

						get fields() {
							return $$props.fields;
						},

						get entries() {
							return $$props.entries;
						},

						get level() {
							return $.get($0);
						},
						minimal: true,
						onchange: (values) => $$props.onchange({
							[$$props.field.key]: { [$$props.index]: { value: null, subValues: values } }
						}),

						get ondelete() {
							return $$props.ondelete;
						}
					});
				}

				$.reset(div_6);
				$.template_effect(() => $.set_attribute(div_6, 'id', `repeater-${$$props.field.key ?? ''}-${$$props.index ?? ''}-${$.get(subfield).key ?? ''}`));
				$.append($$anchor, div_6);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if ($$props.is_visible) $$render(consequent_3);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'RepeaterFieldItem svelte-1hwtezn', null, classes, {
			'hovering-above': $$props.hovering && $$props.hover_position === 'top',
			'hovering-below': $$props.hovering && $$props.hover_position === 'bottom'
		});

		$.set_attribute(div, 'id', `repeater-${$$props.field.key ?? ''}-${$$props.index ?? ''}`);
		$.set_attribute(button, 'title', $mod_key_held() ? 'Toggle all items' : '');
		$.set_attribute(button_1, 'title', `Delete ${$.get(singular_label) ?? ''} item`);
	});

	$.delegated('dblclick', button, () => dispatch('toggleall'));

	$.delegated('click', button, (e) => {
		if ($mod_key_held()) {
			dispatch('toggleall');
		} else {
			dispatch('toggle');
		}
	});

	$.delegated('click', button_1, () => dispatch('remove'));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['dblclick', 'click']);