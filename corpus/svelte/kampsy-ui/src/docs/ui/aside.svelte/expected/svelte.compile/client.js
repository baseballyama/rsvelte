import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { Badge } from "$lib/index.js";

var root = $.from_html(`<li class="py-0.5"><a class="group"><span> <!></span></a></li>`);
var root_1 = $.from_html(`<div><p class="text-kui-black dark:text-kui-dark-gray-1000 mb-0.5 flex h-10 w-full items-center gap-2 py-1.5 pl-3 text-[14px] leading-5 font-medium capitalize"> <!></p> <ul class="relative space-y-0.5"><!></ul></div>`);
var root_2 = $.from_html(`<div class="ui-scrollbar h-full w-full overflow-y-auto scroll-smooth px-4 pt-4 pb-3.5"><!></div>`);

export default function Aside($$anchor, $$props) {
	$.push($$props, true);

	let asideDataList = $.prop($$props, 'asideDataList', 3, undefined);

	const setActive = (url) => {
		if (page.url.pathname.endsWith(url)) {
			return "text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-gray-alpha-100 dark:bg-kui-dark-gray-alpha-100 ";
		}

		return "text-kui-light-gray-900 dark:text-kui-dark-gray-900";
	};

	var div = root_2();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, asideDataList, $.index, ($$anchor, asideData) => {
				var div_1 = root_1();
				var p = $.child(div_1);
				var text = $.child(p);
				var node_2 = $.sibling(text);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => $.get(asideData).title?.badge?.variant || "green");

							Badge($$anchor, {
								size: 'sm',
								get variant() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(asideData).title?.badge?.name));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_2, ($$render) => {
						if ($.get(asideData)?.title?.badge) $$render(consequent);
					});
				}

				$.reset(p);

				var ul = $.sibling(p, 2);
				var node_3 = $.child(ul);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.each(node_4, 17, () => $.get(asideData).ul, $.index, ($$anchor, list, index, $$array) => {
							var li = root();
							var a = $.child(li);
							var span = $.child(a);
							var text_2 = $.child(span);
							var node_5 = $.sibling(text_2);

							{
								var consequent_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(list)?.badge?.variant || "green");

										Badge($$anchor, {
											size: 'sm',
											get variant() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text();

												$.template_effect(() => $.set_text(text_3, $.get(list)?.badge.name));
												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_5, ($$render) => {
									if ($.get(list)?.badge) $$render(consequent_1);
								});
							}

							$.reset(span);
							$.reset(a);
							$.reset(li);

							$.template_effect(
								($0) => {
									$.set_attribute(a, 'href', $.get(list)?.url || "/#");
									$.set_class(span, 1, `flex h-10 w-full items-center gap-x-3 ${$0 ?? ''} group-hover:bg-kui-light-gray-alpha-100 dark:group-hover:bg-kui-dark-gray-alpha-100 group-hover:text-kui-light-gray-1000 dark:group-hover:text-kui-dark-gray-1000 flex items-center rounded-md px-3 py-1.5 text-[14px] leading-5 font-normal capitalize`);
									$.set_text(text_2, `${($.get(list)?.name || "") ?? ''} `);
								},
								[() => setActive($.get(list)?.url || '')]
							);

							$.append($$anchor, li);
						});

						$.append($$anchor, fragment_3);
					};

					$.if(node_3, ($$render) => {
						if ($.get(asideData).ul) $$render(consequent_2);
					});
				}

				$.reset(ul);
				$.reset(div_1);
				$.template_effect(() => $.set_text(text, `${($.get(asideData)?.title?.name || "") ?? ''} `));
				$.append($$anchor, div_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (asideDataList()) $$render(consequent_3);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}