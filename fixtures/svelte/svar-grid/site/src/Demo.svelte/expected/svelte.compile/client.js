import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Globals,
	Willow,
	WillowDark,
	Locale,
	popupContainer,
	Button,
	Segmented
} from "@svar-ui/svelte-core";

import Main from "./Main.svelte";
import LogoIcon from "./icons/Logo.svelte";
import WillowDarkIcon from "./icons/WillowDark.svelte";
import WillowIcon from "./icons/Willow.svelte";

var root = $.from_html(`<div class="btn-back-content svelte-11jsci0"><!> <span class="svelte-11jsci0"> </span></div>`);
var root_1 = $.from_html(`<div class="header-content svelte-11jsci0"><div class="btn-box svelte-11jsci0"><!></div> <h1 class="svelte-11jsci0"> </h1></div>`);
var root_2 = $.from_html(`<!> <span class="svelte-11jsci0"> </span>`, 1);
var root_3 = $.from_html(`<div class="header svelte-11jsci0"><!> <div class="header-actions svelte-11jsci0"><div class="segmented-box svelte-11jsci0"><!></div></div></div> <div><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <div><!></div>`, 1);

export default function Demo($$anchor, $$props) {
	let skin = $.state("willow");
	const isStandalone = window.self === window.top;
	const DEMO_SECTION_URL = `https://svar.dev/svelte/${$$props.productLink}/`;

	const skins = [
		{
			id: "willow",
			label: "Willow",
			component: Willow,
			icon: WillowIcon
		},

		{
			id: "willow-dark",
			label: "Dark",
			component: WillowDark,
			icon: WillowDarkIcon
		}
	];

	function goBack() {
		window.location.href = DEMO_SECTION_URL;
	}

	function changeSkin({ value }) {
		$.set(skin, value, true);
	}

	var fragment = root_4();
	var node = $.first_child(fragment);

	Willow(node, {});

	var node_1 = $.sibling(node, 2);

	WillowDark(node_1, {});

	var div = $.sibling(node_1, 2);
	let classes;
	var node_2 = $.child(div);

	Locale(node_2, {
		children: ($$anchor, $$slotProps) => {
			Globals($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var div_1 = $.first_child(fragment_2);
					var node_3 = $.child(div_1);

					{
						var consequent = ($$anchor) => {
							var div_2 = root_1();
							var div_3 = $.child(div_2);
							var node_4 = $.child(div_3);

							Button(node_4, {
								type: 'secondary',
								css: 'btn-back',
								icon: 'wxi-angle-left',
								onclick: goBack,
								children: ($$anchor, $$slotProps) => {
									var div_4 = root();
									var node_5 = $.child(div_4);

									LogoIcon(node_5, {});

									var span = $.sibling(node_5, 2);
									var text = $.only_child(span);

									$.reset(div_4);
									$.template_effect(() => $.set_text(text, `Go to ${$$props.publicName ?? ''} page`));
									$.append($$anchor, div_4);
								},
								$$slots: { default: true }
							});

							$.reset(div_3);

							var h1 = $.sibling(div_3, 2);
							var text_1 = $.only_child(h1);

							$.reset(div_2);
							$.template_effect(() => $.set_text(text_1, `SVAR Svelte ${$$props.publicName ?? ''} - Live Demo`));
							$.append($$anchor, div_2);
						};

						$.if(node_3, ($$render) => {
							if (isStandalone) $$render(consequent);
						});
					}

					var div_5 = $.sibling(node_3, 2);
					var div_6 = $.child(div_5);
					var node_6 = $.child(div_6);

					{
						const children = ($$anchor, $$arg0) => {
							let option = () => ($$arg0?.()).option;
							const Icon = $.derived(() => option().icon);
							var fragment_3 = root_2();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => $.get(Icon), ($$anchor, Icon_1) => {
								Icon_1($$anchor, {});
							});

							var span_1 = $.sibling(node_7, 2);
							var text_2 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_2, option().label));
							$.append($$anchor, fragment_3);
						};

						Segmented(node_6, {
							get value() {
								return $.get(skin);
							},

							get options() {
								return skins;
							},
							css: 'segmented-themes',
							onchange: changeSkin,
							children,
							$$slots: { default: true }
						});
					}

					$.reset(div_6);
					$.reset(div_5);
					$.reset(div_1);

					var div_7 = $.sibling(div_1, 2);
					var node_8 = $.child(div_7);

					Main(node_8, {});
					$.reset(div_7);
					$.template_effect(() => $.set_class(div_7, 1, `wx-${$.get(skin) ?? ''}-theme main-content`, 'svelte-11jsci0'));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.action(div, ($$node) => popupContainer?.($$node));
	$.template_effect(() => classes = $.set_class(div, 1, 'wx-willow-theme content svelte-11jsci0', null, classes, { standalone: isStandalone }));
	$.append($$anchor, fragment);
}