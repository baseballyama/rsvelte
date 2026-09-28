import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from '$lib/components/ui/sheet';
import MenuIcon from '@lucide/svelte/icons/menu';
import XIcon from '@lucide/svelte/icons/x';
import { groupedDocs } from '$lib/features/docs/docs';

var root = $.from_html(`<!> Menu`, 1);
var root_1 = $.from_html(`<li class="flex flex-col gap-2"><a class="text-xl"> </a></li>`);
var root_2 = $.from_html(`<div class="flex flex-col gap-2"><h3 class="text-muted-foreground text-xs"> </h3> <ul class="flex flex-col gap-2"></ul></div>`);
var root_3 = $.from_html(`<div class="flex flex-col gap-6 px-6 py-6"><div class="flex flex-col gap-2"><h3 class="text-muted-foreground text-xs">Menu</h3> <ul class="flex flex-col gap-2"></ul></div> <!></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Mobile_sheet($$anchor) {
	let open = $.state(false);

	const menuRoutes = [
		{ href: '/', title: 'Home' },
		{ href: '/docs', title: 'Docs' },
		{ href: '/components', title: 'Components' },
		{ href: '/hooks', title: 'Hooks' },
		{ href: '/actions', title: 'Actions' }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
		Sheet_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
					Sheet_Trigger($$anchor, {
						class: 'flex items-center gap-2 md:hidden',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									XIcon($$anchor, { class: 'size-5' });
								};

								var alternate = ($$anchor) => {
									MenuIcon($$anchor, { class: 'size-5' });
								};

								$.if(node_2, ($$render) => {
									if ($.get(open)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Sheet.Content, ($$anchor, Sheet_Content) => {
					Sheet_Content($$anchor, {
						showOverlay: false,
						showCloseButton: false,
						side: 'left',
						class: 'top-(--header-height)! h-[calc(100dvh-var(--header-height))] overflow-y-auto data-[side=left]:w-full',
						children: ($$anchor, $$slotProps) => {
							var div = root_3();
							var div_1 = $.child(div);
							var ul = $.sibling($.child(div_1), 2);

							$.each(ul, 21, () => menuRoutes, (route) => route.href, ($$anchor, route) => {
								var li = root_1();
								var a = $.child(li);
								var text = $.only_child(a, true);

								$.reset(li);

								$.template_effect(() => {
									$.set_attribute(a, 'href', $.get(route).href);
									$.set_text(text, $.get(route).title);
								});

								$.delegated('click', a, () => $.set(open, false));
								$.append($$anchor, li);
							});

							$.reset(ul);
							$.reset(div_1);

							var node_4 = $.sibling(div_1, 2);

							$.each(node_4, 17, () => Object.entries(groupedDocs), ([groupTitle, routes]) => groupTitle, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let groupTitle = () => $.get($$array)[0];
								let routes = () => $.get($$array)[1];
								var div_2 = root_2();
								var h3 = $.child(div_2);
								var text_1 = $.only_child(h3, true);
								var ul_1 = $.sibling(h3, 2);

								$.each(ul_1, 21, routes, (route) => route.href, ($$anchor, route) => {
									var li_1 = root_1();
									var a_1 = $.child(li_1);
									var text_2 = $.only_child(a_1, true);

									$.reset(li_1);

									$.template_effect(() => {
										$.set_attribute(a_1, 'href', $.get(route).href);
										$.set_text(text_2, $.get(route).title);
									});

									$.delegated('click', a_1, () => $.set(open, false));
									$.append($$anchor, li_1);
								});

								$.reset(ul_1);
								$.reset(div_2);
								$.template_effect(() => $.set_text(text_1, groupTitle()));
								$.append($$anchor, div_2);
							});

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);