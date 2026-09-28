import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import { Spinner } from '$lib/components/ui/spinner';
import { cn } from '$lib/utils.js';

export const sizeMap = {
	default: { icon: 'icon', normal: 'default' },
	xs: { icon: 'icon-xs', normal: 'xs' },
	sm: { icon: 'icon-sm', normal: 'sm' },
	lg: { icon: 'icon-lg', normal: 'lg' }
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'loading',
	'onClickPromise',
	'onclick',
	'disabled',
	'class',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Button_1($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		loadingProp = $.prop($$props, 'loading', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let pending = $.state(false);
	const loading = $.derived(() => loadingProp() || $.get(pending));

	{
		let $0 = $.derived(() => cn($.get(loading) && '[&_svg:not([data-loading-icon])]:hidden', $$props.class));
		let $1 = $.derived(() => $.get(loading) || $$props.disabled);

		Button($$anchor, $.spread_props(
			{
				get class() {
					return $.get($0);
				},

				get disabled() {
					return $.get($1);
				},

				onclick: async (e) => {
					$$props.onclick?.(e);

					if ($$props.onClickPromise) {
						$.set(pending, true);

						try {
							await $$props.onClickPromise(e);
						} finally {
							$.set(pending, false);
						}
					}
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							Spinner($$anchor, { 'data-icon': 'inline-start', 'data-loading-icon': true });
						};

						$.if(node, ($$render) => {
							if ($.get(loading)) $$render(consequent);
						});
					}

					var node_1 = $.sibling(node, 2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}