import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Globals, popupContainer, Button, Segmented } from "@svar-ui/svelte-core";
import Router from "./Router.svelte";
import Link from "./Link.svelte";
import { getLinks } from "./helpers";
import { GitHubLogoIcon, LogoIcon } from "../assets/icons/index";

var root = $.from_html(`<div class="group-title svelte-50cyl5"> </div>`);
var root_1 = $.from_html(`<div class="header-back-btn svelte-50cyl5"><div class="btn-box svelte-50cyl5"><!></div></div>`);
var root_2 = $.from_html(`<div class="btn-box svelte-50cyl5"><!></div>`);
var root_3 = $.from_html(`<span style="margin-left:4px;" class="svelte-50cyl5"> </span>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<span class="svelte-50cyl5">See code on GitHub</span>`);
var root_6 = $.from_html(`<div class="svelte-50cyl5"><img alt="GitHub icon" class="svelte-50cyl5"/></div> <!>`, 1);
var root_7 = $.from_html(`<!> <div><div role="tabpanel"><div class="sidebar-content svelte-50cyl5"><div class="sidebar-header svelte-50cyl5"><div class="box-title svelte-50cyl5"><a href="https://svar.dev/svelte/" target="_blank" rel="noopener noreferrer" class="svelte-50cyl5"><img alt="Logo icon" class="box-title-img svelte-50cyl5"/></a> <div class="separator svelte-50cyl5"></div> <a target="_blank" rel="noopener noreferrer" class="svelte-50cyl5"><h1 class="title svelte-50cyl5"> </h1></a></div> <div class="btn-box svelte-50cyl5"><!></div></div> <div class="box-links svelte-50cyl5"></div></div></div> <div class="page-content svelte-50cyl5"><div class="page-header svelte-50cyl5"><!> <div class="page-content-header svelte-50cyl5"><div class="header-title-box svelte-50cyl5"><!> <div class="hint svelte-50cyl5"> </div></div> <div class="header-actions-container svelte-50cyl5"><div class="segmented-box svelte-50cyl5"><!></div> <div class="btn-box svelte-50cyl5"><a target="_blank" rel="noopener noreferrer" class="svelte-50cyl5"><!></a></div></div></div></div> <div class="wrapper-content svelte-50cyl5" role="none"><div role="none"><!></div></div></div></div>`, 1);

export default function Index($$anchor, $$props) {
	$.push($$props, true);

	let skin = $.state($.proxy($$props.skins[0].id));
	let title = $.state("");
	let link = $.state("");
	let show = $.state(true);
	let innerWidth = $.state(0);
	const links = getLinks();
	const MOBILE_BREAKPOINT = 767;
	const isMobileView = $.derived(() => $.get(innerWidth) <= MOBILE_BREAKPOINT);
	const skinSettings = $.derived(() => Object.assign($.get(skinSettings), ($$props.skins.find((a) => a.id === $.get(skin)) || {}).props));

	function changeSkin({ value }) {
		$.set(skin, value, true);
	}

	function toggleSidebar() {
		$.set(show, !$.get(show));
	}

	function updateInfo(ev) {
		$.set(skin, ev.skin, true);
		$.set(title, ev.title, true);
		$.set(link, ev.link, true);
	}

	$.user_effect(() => {
		if ($.get(isMobileView) && $.get(title)) {
			$.set(show, false);
		}
	});

	$.user_effect(() => {
		document.body.className = `wx-${$.get(skin)}-theme`;
	});

	var fragment = root_7();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.skins, $.index, ($$anchor, obj) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => $.get(obj).component, ($$anchor, obj_component) => {
			obj_component($$anchor, {});
		});

		$.append($$anchor, fragment_1);
	});

	var div = $.sibling(node, 2);
	let classes;
	var div_1 = $.child(div);
	let classes_1;
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var a_1 = $.child(div_4);
	var img = $.only_child(a_1);
	var a_2 = $.sibling(a_1, 4);
	var h1 = $.child(a_2);
	var text = $.only_child(h1);

	$.reset(a_2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Button(node_2, {
		type: 'secondary',
		icon: 'wxi-angle-left',
		css: 'toggle-btn',
		onclick: toggleSidebar
	});

	$.reset(div_5);
	$.reset(div_3);

	var div_6 = $.sibling(div_3, 2);

	$.each(div_6, 23, () => links, (data, i) => Array.isArray(data) ? data[0] : `group-${i}`, ($$anchor, data) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		{
			var consequent = ($$anchor) => {
				Link($$anchor, {
					get data() {
						return $.get(data);
					},

					get skin() {
						return $.get(skin);
					},
					onclick: () => $.get(isMobileView) && $.set(show, false)
				});
			};

			var d = $.derived(() => Array.isArray($.get(data)));

			var alternate = ($$anchor) => {
				var div_7 = root();
				var text_1 = $.only_child(div_7, true);

				$.template_effect(() => $.set_text(text_1, $.get(data).group));
				$.append($$anchor, div_7);
			};

			$.if(node_3, ($$render) => {
				if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_2);
	});

	$.reset(div_6);
	$.reset(div_2);
	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var div_9 = $.child(div_8);
	var node_4 = $.child(div_9);

	{
		var consequent_1 = ($$anchor) => {
			var div_10 = root_1();
			var div_11 = $.child(div_10);
			var node_5 = $.child(div_11);

			Button(node_5, {
				icon: 'wxi-angle-left',
				css: 'toggle-btn',
				onclick: toggleSidebar,
				type: 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Back to list');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_11);
			$.reset(div_10);
			$.append($$anchor, div_10);
		};

		$.if(node_4, ($$render) => {
			if ($.get(isMobileView)) $$render(consequent_1);
		});
	}

	var div_12 = $.sibling(node_4, 2);
	var div_13 = $.child(div_12);
	var node_6 = $.child(div_13);

	{
		var consequent_2 = ($$anchor) => {
			var div_14 = root_2();
			var node_7 = $.child(div_14);

			Button(node_7, {
				type: 'secondary',
				icon: 'wxi-angle-right',
				css: 'toggle-btn',
				onclick: toggleSidebar
			});

			$.reset(div_14);
			$.append($$anchor, div_14);
		};

		$.if(node_6, ($$render) => {
			if (!$.get(show) && !$.get(isMobileView)) $$render(consequent_2);
		});
	}

	var div_15 = $.sibling(node_6, 2);
	var text_3 = $.only_child(div_15, true);

	$.reset(div_13);

	var div_16 = $.sibling(div_13, 2);
	var div_17 = $.child(div_16);
	var node_8 = $.child(div_17);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			const Icon = $.derived(() => option().icon);
			var fragment_4 = root_4();
			var node_9 = $.first_child(fragment_4);

			$.component(node_9, () => $.get(Icon), ($$anchor, Icon_1) => {
				Icon_1($$anchor, {});
			});

			var node_10 = $.sibling(node_9, 2);

			{
				var consequent_3 = ($$anchor) => {
					var span = root_3();
					var text_4 = $.only_child(span, true);

					$.template_effect(() => $.set_text(text_4, option().label));
					$.append($$anchor, span);
				};

				$.if(node_10, ($$render) => {
					if (!$.get(isMobileView)) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_4);
		};

		Segmented(node_8, {
			get value() {
				return $.get(skin);
			},

			get options() {
				return $$props.skins;
			},
			css: 'segmented-themes',
			onchange: changeSkin,
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_17);

	var div_18 = $.sibling(div_17, 2);
	var a_3 = $.child(div_18);
	var node_11 = $.child(a_3);

	Button(node_11, {
		type: 'secondary',
		css: 'toggle-btn link-btn',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_6();
			var div_19 = $.first_child(fragment_5);
			var img_1 = $.only_child(div_19);
			var node_12 = $.sibling(div_19, 2);

			{
				var consequent_4 = ($$anchor) => {
					var span_1 = root_5();

					$.append($$anchor, span_1);
				};

				$.if(node_12, ($$render) => {
					if (!$.get(isMobileView)) $$render(consequent_4);
				});
			}

			$.template_effect(() => $.set_attribute(img_1, 'src', GitHubLogoIcon));
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(a_3);
	$.reset(div_18);
	$.reset(div_16);
	$.reset(div_12);
	$.reset(div_9);

	var div_20 = $.sibling(div_9, 2);
	var div_21 = $.child(div_20);
	var node_13 = $.child(div_21);

	Globals(node_13, {
		children: ($$anchor, $$slotProps) => {
			Router($$anchor, {
				onnewpage: updateInfo,
				get skin() {
					return $.get(skin);
				},

				get productTag() {
					return $$props.productTag;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_21);
	$.action(div_21, ($$node) => popupContainer?.($$node));
	$.reset(div_20);
	$.reset(div_8);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'layout svelte-50cyl5', null, classes, { active: $.get(show), narrow: $.get(isMobileView) });
		classes_1 = $.set_class(div_1, 1, 'sidebar svelte-50cyl5', null, classes_1, { active: $.get(show) });
		$.set_attribute(img, 'src', LogoIcon);
		$.set_attribute(a_2, 'href', `https://svar.dev/svelte/${$$props.productLink}/`);
		$.set_text(text, `Svelte ${$$props.publicName ?? ''}`);
		$.set_text(text_3, $.get(title));
		$.set_attribute(a_3, 'href', $.get(link));
		$.set_class(div_21, 1, `content wx-${$.get(skin) ?? ''}-theme`, 'svelte-50cyl5');
	});

	$.bind_window_size('innerWidth', ($$value) => $.set(innerWidth, $$value, true));
	$.delegated('click', div_20, () => $.set(show, false));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);