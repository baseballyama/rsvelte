import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { onDestroy } from 'svelte';
import RepeaterFieldItem from './RepeaterFieldItem.svelte';
import * as idb from 'idb-keyval';
import pluralize from 'pluralize';
import { get_empty_value } from '../utils';

var root = $.from_html(`<p class="primo--field-label"> </p>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<div><!> <ul class="fields svelte-rnwm7y"></ul> <button class="field-button svelte-rnwm7y"><!> <span> </span></button></div>`);

export default function RepeaterField($$anchor, $$props) {
	$.push($$props, true);

	let repeater_entries = $.derived(() => $$props.entries?.filter((r) => r.field === $$props.field.id && ($$props.parent ? r.parent === $$props.parent.id : !r.parent)).sort((a, b) => a.index - b.index));
	let subfields = $.derived(() => $$props.fields?.filter((f) => f.parent === $$props.field.id).sort((a, b) => a.index - b.index));
	let repeater_item_just_created = $.state(null // to autofocus on creation
	);

	function add_item() {
		$.set(repeater_item_just_created, 0);

		for (const entry of $.get(repeater_entries)) {
			if (entry.index >= $.get(repeater_item_just_created)) {
				$.set(repeater_item_just_created, entry.index + 1);
			}
		}

		$$props.onchange({
			[$$props.field.key]: {
				[$.get(repeater_item_just_created)]: {
					value: null,
					subValues: Object.fromEntries($.get(subfields).map((subfield) => [subfield.key, { 0: { value: get_empty_value(subfield) } }]))
				}
			}
		});

		$.get(visibleRepeaters)[`${$$props.field.key}-${$.get(repeater_item_just_created)}`] = true;
	}

	let visibleRepeaters = $.state($.proxy({}));

	idb.get($$props.field.id).then((res) => {
		if (res) {
			$.set(visibleRepeaters, res, true);
		}
	});

	onDestroy(() => {
		// save visible repeaters
		idb.set($$props.field.id, { ...$.get(visibleRepeaters) });
	});

	// TODO: Handle these
	let show_label = false;

	let hover_index = $.state(null);
	let hover_position = $.state(null);
	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.field.label));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (show_label) $$render(consequent);
		});
	}

	var ul = $.sibling(node, 2);

	$.each(ul, 21, () => $.get(repeater_entries), (entry) => entry.id, ($$anchor, entry) => {
		const index = $.derived(() => $.get(entry).index);
		const subfield_id = $.derived(() => `${$$props.field.key}-${$.get(index)}`);
		const autofocus = $.derived(() => $.get(index) === $.get(repeater_item_just_created));
		const hovering = $.derived(() => $.get(hover_index) === $.get(index));
		var li = root_1();
		var node_1 = $.child(li);

		RepeaterFieldItem(node_1, {
			get entity() {
				return $$props.entity;
			},

			get field() {
				return $$props.field;
			},

			get entry() {
				return $.get(entry);
			},

			get index() {
				return $.get(index);
			},

			get fields() {
				return $$props.fields;
			},

			get subfields() {
				return $.get(subfields);
			},

			get entries() {
				return $$props.entries;
			},

			get level() {
				return $$props.level;
			},

			get autofocus() {
				return $.get(autofocus);
			},

			get onchange() {
				return $$props.onchange;
			},

			get ondelete() {
				return $$props.ondelete;
			},

			get is_visible() {
				return $.get(visibleRepeaters)[$.get(subfield_id)];
			},

			get hovering() {
				return $.get(hovering);
			},

			get hover_position() {
				return $.get(hover_position);
			},

			$$events: {
				toggle: () => $.get(visibleRepeaters)[$.get(subfield_id)] = !$.get(visibleRepeaters)[$.get(subfield_id)],
				toggleall: () => {
					const all_visible = $.get(repeater_entries).every((e) => $.get(visibleRepeaters)[`${$$props.field.key}-${e.index}`]);

					$.get(repeater_entries).forEach((e) => {
						$.get(visibleRepeaters)[`${$$props.field.key}-${e.index}`] = !all_visible;
					});
				},

				hover: ({ detail }) => {
					$.set(hover_index, $.get(index), true);
					$.set(hover_position, detail, true);
				},

				move: function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				},

				remove: () => {
					// Delete the repeater item entry
					// PocketBase cascade deletion will automatically clean up all sub-entries
					if ($$props.ondelete) {
						$$props.ondelete($.get(entry).id);
					}

					// Remove from visible repeaters tracking
					delete $.get(visibleRepeaters)[`${$$props.field.key}-${$.get(index)}`];
				},

				keydown: function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				},

				add: function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				}
			}
		});

		$.reset(li);
		$.append($$anchor, li);
	});

	$.reset(ul);

	var button = $.sibling(ul, 2);
	var node_2 = $.child(button);

	Icon(node_2, { icon: 'akar-icons:plus' });

	var span = $.sibling(node_2, 2);
	var text_1 = $.only_child(span);

	$.reset(button);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, `RepeaterField repeater-level-${$$props.level ?? ''}`, 'svelte-rnwm7y');
			$.set_text(text_1, `Create ${$0 ?? ''}`);
		},
		[() => pluralize.singular($$props.field.label)]
	);

	$.delegated('click', button, add_item);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);