import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteGantt, SvelteGanttTable } from 'svelte-gantt/svelte';
import { defaultOptions, time } from '$lib';

var root = $.from_html(`<span><input type="radio"/> <label><code> </code></label></span>`);
var root_1 = $.from_html(`<div class="border"><div class="flex gap-2 justify-center border-b p-2"><span><code>layout</code>:</span> <!></div> <div class="example svelte-zuv2a"><!></div></div>`);

export default function LayoutExample($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	let layout = 'overlap';
	const values = ['overlap', 'pack', 'expand'];
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 2);

	$.each(node, 17, () => values, $.index, ($$anchor, value) => {
		var span = root();
		var input = $.child(span);

		$.remove_input_defaults(input);

		var input_value;
		var label = $.sibling(input, 2);
		var code = $.child(label);
		var text = $.only_child(code);

		$.reset(label);
		$.reset(span);

		$.template_effect(() => {
			$.set_attribute(input, 'id', $.get(value));

			if (input_value !== (input_value = $.get(value))) {
				input.value = (input.__value = input_value) ?? '';
			}

			$.set_attribute(label, 'for', $.get(value));
			$.set_text(text, `'${$.get(value) ?? ''}'`);
		});

		$.bind_group(
			binding_group,
			[],
			input,
			() => {
				$.get(value);

				return layout;
			},
			($$value) => layout = $$value
		);

		$.append($$anchor, span);
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => time('8:00'));
		let $1 = $.derived(() => time('14:00'));

		let $2 = $.derived(() => [
			{
				id: 1,
				resourceId: 1,
				from: time('8:00'),
				to: time('10:00'),
				label: 'Default',
				classes: 'blue'
			},

			{
				id: 2,
				resourceId: 1,
				from: time('9:00'),
				to: time('11:00'),
				label: 'Default',
				classes: 'orange'
			},

			{
				id: 3,
				resourceId: 1,
				from: time('9:30'),
				to: time('12:00'),
				label: 'Default',
				classes: 'violet'
			},

			{
				id: 4,
				resourceId: 2,
				from: time('9:00'),
				to: time('11:00'),
				label: 'Default',
				classes: 'blue'
			},

			{
				id: 5,
				resourceId: 2,
				from: time('9:30'),
				to: time('11:00'),
				label: 'Default',
				classes: 'orange'
			},

			{
				id: 6,
				resourceId: 2,
				from: time('11:00'),
				to: time('13:00'),
				label: 'Default',
				classes: 'violet'
			},

			{
				id: 7,
				resourceId: 3,
				from: time('9:00'),
				to: time('11:00'),
				label: 'Default',
				classes: 'blue'
			}
		]);

		let $3 = $.derived(() => [SvelteGanttTable]);

		SvelteGantt(node_1, {
			get from() {
				return $.get($0);
			},

			get to() {
				return $.get($1);
			},

			get layout() {
				return layout;
			},

			rows: [
				{ id: 1, label: 'Resource #1' },
				{ id: 2, label: 'Resource #2' },
				{ id: 3, label: 'Resource #3' },
				{ id: 4, label: 'Resource #4' }
			],

			get tasks() {
				return $.get($2);
			},

			get ganttTableModules() {
				return $.get($3);
			}
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}