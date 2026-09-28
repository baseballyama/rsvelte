import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as FormPrimitive from 'formsnap';
import { Label } from '$lib/components/ui/label/index.js';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'children',
	'class'
]);

export default function Form_label($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;

			{
				let $0 = $.derived(() => cn('data-[fs-error]:text-destructive', $$props.class));

				Label($$anchor, $.spread_props(props, {
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		};

		$.component(node, () => FormPrimitive.Label, ($$anchor, FormPrimitive_Label) => {
			FormPrimitive_Label($$anchor, $.spread_props(() => restProps, {
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},
				child,
				$$slots: { child: true }
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}