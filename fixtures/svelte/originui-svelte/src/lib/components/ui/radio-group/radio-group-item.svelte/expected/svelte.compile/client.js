import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref', 'value']);
var root = $.from_html(`<div class="flex items-center justify-center text-current"><svg width="6" height="6" viewBox="0 0 6 6" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="3" r="3"></circle></svg></div>`);

export default function Radio_group_item($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 7),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 11, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var $$exports = {
		get class() {
			return className();
		},

		set class($$value) {
			className($$value);
		}
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let checked = () => ($$arg0?.()).checked;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();

					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (checked()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => cn('border-input ring-offset-background focus-visible:ring-ring data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aspect-square size-4 rounded-full border shadow-xs shadow-black/[.04] transition-shadow focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className()));

		$.component(node, () => RadioGroupPrimitive.Item, ($$anchor, RadioGroupPrimitive_Item) => {
			RadioGroupPrimitive_Item($$anchor, $.spread_props(
				{
					get value() {
						return value();
					},

					get class() {
						return $.get($0);
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
					children,
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}