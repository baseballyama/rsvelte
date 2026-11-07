import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Dialog as DialogPrimitive } from 'bits-ui';
import { Button } from '$lib/components/ui/button/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'showCloseButton'
]);

var root = $.from_html(`<div><!> <!></div>`);

export default function Dialog_footer($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		showCloseButton = $.prop($$props, 'showCloseButton', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ 'data-slot': 'dialog-footer', class: $0, ...restProps }), [
		() => cn('flex flex-col-reverse gap-2 gap-2 sm:flex-row sm:justify-end', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Close');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					}));
				};

				$.component(node_2, () => DialogPrimitive.Close, ($$anchor, DialogPrimitive_Close) => {
					DialogPrimitive_Close($$anchor, { child, $$slots: { child: true } });
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (showCloseButton()) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}