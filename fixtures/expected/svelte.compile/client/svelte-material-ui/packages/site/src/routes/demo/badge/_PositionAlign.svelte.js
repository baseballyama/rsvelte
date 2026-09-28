import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from '@smui-extra/badge';
import Button, { Label } from '@smui/button';
import Radio from '@smui/radio';
import FormField from '@smui/form-field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="margin-top: 2em; text-align: center;"><!></div> <div style="margin-top: 2em;">Position: <!></div> <div style="margin-top: 2em;">Y Alignment: <!></div> <div style="margin-top: 2em;">X Alignment: <!></div>`, 1);

export default function _PositionAlign($$anchor) {
	const binding_group = [];
	const binding_group_1 = [];
	const binding_group_2 = [];
	let position = $.state('middle');
	let alignY = $.state('top');
	let alignX = $.state('end');
	const align = $.derived(() => `${$.get(alignY)}-${$.get(alignX)}`);
	const positions = ['inset', 'middle', 'outset'];
	const alignmentsY = ['top', 'middle', 'bottom'];
	const alignmentsX = ['start', 'middle', 'end'];
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		style: 'position: relative;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Label(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Button');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Badge(node_2, {
				get position() {
					return $.get(position);
				},

				get align() {
					return $.get(align);
				},
				'aria-label': 'unread count',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('8');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_1));

	$.each(node_3, 17, () => positions, $.index, ($$anchor, pos) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text_2 = $.text();

				$.template_effect(() => $.set_text(text_2, $.get(pos)));
				$.append($$anchor, text_2);
			};

			FormField($$anchor, {
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return $.get(pos);
						},

						get group() {
							return $.get(position);
						},

						set group($$value) {
							$.set(position, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.sibling($.child(div_2));

	$.each(node_4, 17, () => alignmentsY, $.index, ($$anchor, alignment) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text_3 = $.text();

				$.template_effect(() => $.set_text(text_3, $.get(alignment)));
				$.append($$anchor, text_3);
			};

			FormField($$anchor, {
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return $.get(alignment);
						},

						get group() {
							return $.get(alignY);
						},

						set group($$value) {
							$.set(alignY, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_5 = $.sibling($.child(div_3));

	$.each(node_5, 17, () => alignmentsX, $.index, ($$anchor, alignment) => {
		{
			const label = ($$anchor) => {
				$.next();

				var text_4 = $.text();

				$.template_effect(() => $.set_text(text_4, $.get(alignment)));
				$.append($$anchor, text_4);
			};

			FormField($$anchor, {
				label,
				children: ($$anchor, $$slotProps) => {
					Radio($$anchor, {
						get value() {
							return $.get(alignment);
						},

						get group() {
							return $.get(alignX);
						},

						set group($$value) {
							$.set(alignX, $$value, true);
						}
					});
				},
				$$slots: { label: true, default: true }
			});
		}
	});

	$.reset(div_3);
	$.append($$anchor, fragment);
}