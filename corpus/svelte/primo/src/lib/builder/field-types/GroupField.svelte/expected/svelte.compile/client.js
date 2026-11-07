import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { find as _find, chain as _chain } from 'lodash-es';
import Icon from '@iconify/svelte';
import { fieldTypes } from '../stores/app';
import EntryContent from '../components/Fields/EntryContent.svelte';

var root = $.from_html(`<button class="svelte-1flpwt3"><span class="svelte-1flpwt3"> </span> <!></button>`);
var root_1 = $.from_html(`<div class="no-subfields"><span>No subfields in this group. Add subfields in the Field tab.</span></div>`);
var root_2 = $.from_html(`<div class="group-entries svelte-1flpwt3"><!></div>`);
var root_3 = $.from_html(`<div><!> <!></div>`);

export default function GroupField($$anchor, $$props) {
	$.push($$props, true);

	const group_entry = $.derived(() => $$props.entry);
	const subfields = $.derived(() => $$props.fields.filter((f) => f.parent === $$props.field.id).sort((a, b) => a.index - b.index));
	let hidden = $.state(false);
	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var button = root();
			var span = $.child(button);
			var text = $.only_child(span, true);
			var node_1 = $.sibling(span, 2);

			{
				let $0 = $.derived(() => $.get(hidden) ? 'ph:caret-up-bold' : 'ph:caret-down-bold');

				Icon(node_1, {
					get icon() {
						return $.get($0);
					}
				});
			}

			$.reset(button);
			$.template_effect(() => $.set_text(text, $$props.field.label));
			$.delegated('click', button, () => $.set(hidden, !$.get(hidden)));
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($$props.level > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_2();
			var node_3 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var div_2 = root_1();

					$.append($$anchor, div_2);
				};

				var alternate = ($$anchor) => {
					var fragment = $.comment();
					var node_4 = $.first_child(fragment);

					$.each(node_4, 17, () => $.get(subfields), (subfield) => subfield.id, ($$anchor, subfield) => {
						{
							let $0 = $.derived(() => $$props.level + 1);

							EntryContent($$anchor, {
								get entity() {
									return $$props.entity;
								},

								get parent() {
									return $.get(group_entry);
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
									[$$props.field.key]: { 0: { value: null, subValues: values } }
								}),

								get ondelete() {
									return $$props.ondelete;
								}
							});
						}
					});

					$.append($$anchor, fragment);
				};

				$.if(node_3, ($$render) => {
					if ($.get(subfields).length === 0) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(hidden)) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `group-field group-level-${$$props.level ?? ''}`, 'svelte-1flpwt3'));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);