import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from "svelte";
import { getListHandlers } from "../listnav";
import Dropdown from "../../Dropdown.svelte";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div class="wx-no-data svelte-1y59czs"> </div>`);
var root_2 = $.from_html(`<div class="wx-list svelte-1y59czs"><!></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	let list = $.state(void 0);
	let navIndex = $.state(null);
	const _ = getContext("wx-i18n").getGroup("core");
	const { move, keydown, init, navigate } = getListHandlers();

	const selectItem = (ev) => {
		if (ev) ev.stopPropagation();

		$$props.onselect && $$props.onselect({ id: items()[$.get(navIndex)]?.id });
	};

	$.user_effect(() => {
		init($.get(list), items(), (i) => $.set(navIndex, i, true), selectItem);
	});

	onMount(() => {
		$$props.onready && $$props.onready({ navigate, keydown, move });
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			Dropdown($$anchor, {
				oncancel: () => navigate(null),
				children: ($$anchor, $$slotProps) => {
					var div = root_2();
					var node_1 = $.child(div);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 19, items, (data) => data.id, ($$anchor, data, index) => {
								var div_1 = root();
								let classes;
								var node_3 = $.child(div_1);

								{
									var consequent = ($$anchor) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.snippet(node_4, () => $$props.children, () => ({ option: $.get(data) }));
										$.append($$anchor, fragment_3);
									};

									var alternate = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(data).label));
										$.append($$anchor, text);
									};

									$.if(node_3, ($$render) => {
										if ($$props.children) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.reset(div_1);

								$.template_effect(() => {
									classes = $.set_class(div_1, 1, 'wx-item svelte-1y59czs', null, classes, { 'wx-focus': $.get(index) === $.get(navIndex) });
									$.set_attribute(div_1, 'data-id', $.get(data).id);
								});

								$.append($$anchor, div_1);
							});

							$.append($$anchor, fragment_2);
						};

						var alternate_1 = ($$anchor) => {
							var div_2 = root_1();
							var text_1 = $.only_child(div_2, true);

							$.template_effect(($0) => $.set_text(text_1, $0), [() => _("No data")]);
							$.append($$anchor, div_2);
						};

						$.if(node_1, ($$render) => {
							if (items().length) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.reset(div);
					$.bind_this(div, ($$value) => $.set(list, $$value), () => $.get(list));
					$.delegated('click', div, selectItem);
					$.delegated('mousemove', div, move);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(navIndex) !== null) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'mousemove']);