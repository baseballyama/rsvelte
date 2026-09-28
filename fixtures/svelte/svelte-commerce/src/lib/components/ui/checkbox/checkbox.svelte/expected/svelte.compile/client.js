import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox as CheckboxPrimitive } from 'bits-ui';
import { Check, Minus } from '@lucide/svelte';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'checked']);
var root = $.from_html(`<span class="flex size-4 items-center justify-center text-current"><!></span>`);

export default function Checkbox($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		checked = $.prop($$props, 'checked', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			var span = root();
			var node_1 = $.child(span);

			{
				var consequent = ($$anchor) => {
					Minus($$anchor, { class: 'size-3.5' });
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => cn('size-3.5', !checked() && 'text-transparent'));

						Check($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if ($$props.indeterminate) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		let $0 = $.derived(() => cn('peer box-content size-4 shrink-0 rounded-sm border border-primary shadow data-[disabled=true]:cursor-not-allowed data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', $$props.class));

		$.component(node, () => CheckboxPrimitive.Root, ($$anchor, CheckboxPrimitive_Root) => {
			CheckboxPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get checked() {
						return checked();
					},

					set checked($$value) {
						checked($$value);
					},

					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					},
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}