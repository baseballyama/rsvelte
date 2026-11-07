import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DialogTitle from './dialog-title.svelte';
import { Loader } from 'lucide-svelte';
import Icon from '@iconify/svelte';
import { cn } from '$lib/utils.js';
import { Button } from '$lib/components/ui/button';
import { mod_key_held } from '$lib/builder/stores/app/misc.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'title',
	'icon',
	'button'
]);

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<span class="absolute inset-0 flex items-center justify-center"> </span>`);
var root_2 = $.from_html(`<div class="animate-spin absolute inset-0 flex items-center justify-center"><!></div>`);
var root_3 = $.from_html(`<span> </span> <!> <!>`, 1);
var root_4 = $.from_html(`<div><div class="ml-6"><!></div> <!> <!></div>`);

export default function Dialog_header($$anchor, $$props) {
	$.push($$props, true);

	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_4();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn('grid grid-cols-3 items-center', $$props.class)]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	DialogTitle(node_1, {
		class: 'text-center flex items-center justify-center gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					Icon($$anchor, {
						get icon() {
							return $$props.icon;
						},
						class: 'h-4 w-4'
					});
				};

				$.if(node_2, ($$render) => {
					if ($$props.icon) $$render(consequent);
				});
			}

			var span = $.sibling(node_2, 2);
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			Button($$anchor, {
				variant: 'default',
				get onclick() {
					return $$props.button.onclick;
				},

				get disabled() {
					return $$props.button.disabled;
				},
				class: 'justify-self-end inline-flex justify-center items-center relative',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var span_1 = $.first_child(fragment_3);
					let classes;
					var text_1 = $.only_child(span_1, true);
					var node_4 = $.sibling(span_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var span_2 = root_1();
							var text_2 = $.only_child(span_2, true);

							$.template_effect(() => $.set_text(text_2, $$props.button.hint));
							$.append($$anchor, span_2);
						};

						$.if(node_4, ($$render) => {
							if ($$props.button.hint && $mod_key_held() && !$$props.button.loading) $$render(consequent_1);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_2 = ($$anchor) => {
							var div_2 = root_2();
							var node_6 = $.child(div_2);

							Loader(node_6, {});
							$.reset(div_2);
							$.append($$anchor, div_2);
						};

						$.if(node_5, ($$render) => {
							if ($$props.button.loading) $$render(consequent_2);
						});
					}

					$.template_effect(() => {
						classes = $.set_class(span_1, 1, '', null, classes, {
							'opacity-0': $$props.button.hint && $mod_key_held() || $$props.button.loading
						});

						$.set_text(text_1, $$props.button.label);
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_3, ($$render) => {
			if ($$props.button?.label) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}