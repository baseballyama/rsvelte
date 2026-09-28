import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Details from '../Details.svelte';

var root = $.from_html(`<div class="mb-2 flex flex-row items-end justify-start gap-1 py-1 pt-4 text-xs font-bold tracking-wide text-white uppercase"> </div>`);
var root_1 = $.from_html(`<li><a> </a></li>`);
var root_2 = $.from_html(`<ul class="my-2"></ul>`);

export default function LeftSidebarCategory($$anchor, $$props) {
	$.push($$props, true);

	let open = true;

	const trim = (x) => {
		x = x.startsWith('/') ? x.slice(1) : x;
		x = x.endsWith('/') ? x.slice(0, -1) : x;

		return x;
	};

	{
		const summary = ($$anchor) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.category.title));
			$.append($$anchor, text);
		};

		Details($$anchor, {
			open,
			get id() {
				return `sidebar-category-${$$props.category.title ?? ''}`;
			},
			summary,
			children: ($$anchor, $$slotProps) => {
				var ul = root_2();

				$.each(ul, 21, () => $$props.category.menuItems, $.index, ($$anchor, item) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var text_1 = $.only_child(div, true);

							$.template_effect(() => $.set_text(text_1, $.get(item).title));
							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var li = root_1();
							var a = $.child(li);
							var text_2 = $.only_child(a, true);

							$.reset(li);

							$.template_effect(
								($0, $1) => {
									$.set_class(li, 1, $0);
									$.set_attribute(a, 'href', $1);
									$.set_text(text_2, $.get(item).title);
								},
								[
									() => $.clsx([
										'sidebar-list-item',
										trim($$props.activeUrlPathName) === trim(`${$$props.category.urlPrefix}/${$.get(item).slug}`) ? 'border-orange! text-orange font-bold' : 'text-faded'
									]),
									() => `${$$props.baseUrl}${$$props.category.urlPrefix.substring(1)}/${$.get(item).slug}`
								]
							);

							$.append($$anchor, li);
						};

						$.if(node, ($$render) => {
							if ($.get(item).isDivider) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			},
			$$slots: { summary: true, default: true }
		});
	}

	$.pop();
}