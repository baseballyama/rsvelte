import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useIntersectionObserver } from 'runed';
import { Field, Switch } from 'svelte-ux';

var root = $.from_html(`<div class="grid grid-cols-[auto_1fr] gap-2 mb-3 screenshot-hidden screenshot-delay"><!></div>`);
var root_1 = $.from_html(`<div class="screenshot-delay"><!></div>`);

export default function ShowField($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15),
		label = $.prop($$props, 'label', 3, 'Show'),
		labelPlacement = $.prop($$props, 'labelPlacement', 3, 'left'),
		inline = $.prop($$props, 'inline', 3, false),
		className = $.prop($$props, 'class', 3, 'absolute top-2 right-2 z-1');

	let target = $.state(null);

	useIntersectionObserver(
		() => $.get(target),
		(entries) => {
			const entry = entries[0];

			if (entry?.isIntersecting) {
				setTimeout(
					() => {
						show(true);
					},
					750
				);
			}
		},
		{ once: true }
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Field(node_1, {
				get label() {
					return label();
				},

				get labelPlacement() {
					return labelPlacement();
				},

				get class() {
					return className();
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							size: 'md',
							get checked() {
								return show();
							},

							set checked($$value) {
								show($$value);
							}
						});
					}
				}
			});

			$.reset(div);
			$.bind_this(div, ($$value) => $.set(target, $$value), () => $.get(target));
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			Field(node_2, {
				get label() {
					return label();
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Switch($$anchor, {
							size: 'md',
							get checked() {
								return show();
							},

							set checked($$value) {
								show($$value);
							}
						});
					}
				}
			});

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(target, $$value), () => $.get(target));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!inline()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}