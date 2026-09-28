import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ChevronRight } from '@lucide/svelte';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';

var root = $.from_html(`<div class="flex items-center justify-center gap-2"><span> </span> <!></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Checkout_button($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false),
		loading = $.prop($$props, 'loading', 3, false),
		text = $.prop($$props, 'text', 3, 'Proceed to Shipping'),
		disabledText = $.prop($$props, 'disabledText', 3, ''),
		className = $.prop($$props, 'class', 3, '');

	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => disabled() || loading());

		Button(node, {
			class: 'ease-out-expo group w-full bg-primary py-7 text-sm font-bold tracking-[0.2em] uppercase shadow-lg transition-all duration-300 hover:shadow-xl max-sm:h-20 max-sm:rounded-none disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:border-gray-200 disabled:border disabled:opacity-100',
			get disabled() {
				return $.get($0);
			},

			get onclick() {
				return $$props.onclick;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						LoadingDots($$anchor, {});
					};

					var alternate = ($$anchor) => {
						var div_1 = root();
						var span = $.child(div_1);
						var text_1 = $.only_child(span, true);
						var node_2 = $.sibling(span, 2);

						{
							var consequent_1 = ($$anchor) => {
								ChevronRight($$anchor, {
									class: 'size-4 transition-transform duration-300 group-hover:translate-x-1'
								});
							};

							$.if(node_2, ($$render) => {
								if (!disabled()) $$render(consequent_1);
							});
						}

						$.reset(div_1);
						$.template_effect(() => $.set_text(text_1, disabled() && disabledText() ? disabledText() : text()));
						$.append($$anchor, div_1);
					};

					$.if(node_1, ($$render) => {
						if (loading()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `w-full max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:z-[60] ${className() ?? ''}`));
	$.append($$anchor, div);
}