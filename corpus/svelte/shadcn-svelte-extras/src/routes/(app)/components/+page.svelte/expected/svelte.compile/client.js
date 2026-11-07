import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { components } from '$content/index.js';
import * as InputGroup from '$lib/components/ui/input-group';
import SearchIcon from '@lucide/svelte/icons/search';
import * as Kbd from '$lib/components/ui/kbd';
import { shortcut } from '$lib/actions/shortcut.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<span class="bg-brand flex size-2 rounded-full" title="New"></span>`);
var root_2 = $.from_html(`<div class="border-border hover:bg-accent relative rounded-lg p-4"><a class="flex items-center gap-2 text-lg font-medium"><span class="absolute inset-0"></span> <!></a> <p class="text-muted-foreground text-sm"> </p></div>`);
var root_3 = $.from_html(`<div class="flex flex-col items-center gap-8"><div class="flex w-full flex-col items-center gap-2 pt-6 pb-3 md:pt-10 md:pb-6 lg:pt-20 lg:pb-10"><h1 class="text-center text-5xl font-medium">Components</h1> <p class="text-center text-lg">Browser our library of beautiful, composable components.</p> <!></div> <div class="container"><div class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let search = $.state('');
	let searchInput = $.state(null);

	const filteredComponents = $.derived(() => {
		return components.filter((component) => {
			return component.title.toLowerCase().includes($.get(search).toLowerCase());
		});
	});

	var div = root_3();

	$.action($.window, ($$node, $$action_arg) => shortcut?.($$node, $$action_arg), () => ({
		key: '/',
		callback: () => {
			$.get(searchInput)?.focus();
		}
	}));

	var div_1 = $.child(div);
	var node = $.sibling($.child(div_1), 4);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			class: 'mt-4 w-full max-w-md',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, {
						placeholder: 'Search components...',
						get ref() {
							return $.get(searchInput);
						},

						set ref($$value) {
							$.set(searchInput, $$value, true);
						},

						get value() {
							return $.get(search);
						},

						set value($$value) {
							$.set(search, $$value, true);
						}
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							SearchIcon($$anchor, { class: 'size-4 shrink-0 opacity-50' });
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root) => {
								Kbd_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('/');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);

	$.each(div_3, 21, () => $.get(filteredComponents), (component) => component.path, ($$anchor, component) => {
		var div_4 = root_2();
		var a = $.child(div_4);
		var text_1 = $.sibling($.child(a));
		var node_5 = $.sibling(text_1);

		{
			var consequent = ($$anchor) => {
				var span = root_1();

				$.append($$anchor, span);
			};

			$.if(node_5, ($$render) => {
				if ($.get(component).indicator === 'new') $$render(consequent);
			});
		}

		$.reset(a);

		var p = $.sibling(a, 2);
		var text_2 = $.only_child(p, true);

		$.reset(div_4);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(component).href);
			$.set_text(text_1, ` ${$.get(component).title ?? ''} `);
			$.set_text(text_2, $.get(component).description);
		});

		$.append($$anchor, div_4);
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}