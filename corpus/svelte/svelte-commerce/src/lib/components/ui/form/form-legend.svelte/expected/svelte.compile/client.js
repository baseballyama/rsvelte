import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Form_legend($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('text-sm font-medium leading-none data-[fs-error]:text-destructive', $$props.class));

		$.component(node, () => FormPrimitive.Legend, ($$anchor, FormPrimitive_Legend) => {
			FormPrimitive_Legend($$anchor, $.spread_props(() => restProps, {
				get class() {
					return $.get($0);
				},

				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}