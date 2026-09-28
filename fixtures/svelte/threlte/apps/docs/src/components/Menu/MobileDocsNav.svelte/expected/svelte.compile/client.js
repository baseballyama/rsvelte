import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Details from './Details.svelte';
import LeftSidebarCategory from './LeftSidebar/LeftSidebarCategory.svelte';
import MobileNav from './MobileNav.svelte';

var root = $.from_html(`<a class="flex flex-row gap-3"><!></a>`);
var root_1 = $.from_html(`<div class="font-normal"><!></div>`);
var root_2 = $.from_html(`<li class="mt-2 mb-0 ml-4 text-sm"><!></li>`);
var root_3 = $.from_html(`<li><!></li>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-4 text-lg"><ul class="flex flex-col gap-2 overflow-y-auto"></ul> <hr/>  <!></div>`);

export default function MobileDocsNav($$anchor, $$props) {
	$.push($$props, true);

	const keys = ['learn', 'reference', 'examples'];

	{
		const topbarLeft = ($$anchor) => {
			var a = root();
			var node = $.child(a);

			$.snippet(node, () => $$props.logo ?? $.noop);
			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', import.meta.env.BASE_URL));
			$.append($$anchor, a);
		};

		const content = ($$anchor) => {
			var div = root_4();
			var ul = $.child(div);

			$.each(ul, 21, () => keys, $.index, ($$anchor, key) => {
				var li = root_3();
				var node_1 = $.child(li);

				{
					const summary = ($$anchor) => {
						var div_1 = root_1();
						var node_2 = $.child(div_1);

						{
							var consequent = ($$anchor) => {
								var text = $.text('Learn');

								$.append($$anchor, text);
							};

							var consequent_1 = ($$anchor) => {
								var text_1 = $.text('Reference');

								$.append($$anchor, text_1);
							};

							var consequent_2 = ($$anchor) => {
								var text_2 = $.text('Examples');

								$.append($$anchor, text_2);
							};

							$.if(node_2, ($$render) => {
								if ($.get(key) === 'learn') $$render(consequent); else if ($.get(key) === 'reference') $$render(consequent_1, 1); else if ($.get(key) === 'examples') $$render(consequent_2, 2);
							});
						}

						$.reset(div_1);
						$.append($$anchor, div_1);
					};

					let $0 = $.derived(() => $$props.activeSidebarTab === $.get(key));

					Details(node_1, {
						get id() {
							return $.get(key);
						},

						get open() {
							return $.get($0);
						},
						summary,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.each(node_3, 17, () => $$props.sidebarMenu[$.get(key)].categories, $.index, ($$anchor, category) => {
								var li_1 = root_2();
								var node_4 = $.child(li_1);

								LeftSidebarCategory(node_4, {
									get category() {
										return $.get(category);
									},

									get activeUrlPathName() {
										return $$props.activeUrlPathName;
									},

									get baseUrl() {
										return $$props.baseUrl;
									}
								});

								$.reset(li_1);
								$.append($$anchor, li_1);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { summary: true, default: true }
					});
				}

				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);

			var node_5 = $.sibling(ul, 4);

			$.snippet(node_5, () => $$props.socials ?? $.noop);
			$.reset(div);
			$.append($$anchor, div);
		};

		MobileNav($$anchor, {
			search: true,
			topbarLeft,
			content,
			$$slots: { topbarLeft: true, content: true }
		});
	}

	$.pop();
}