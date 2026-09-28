import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const home = ($$anchor) => {
	var svg = root();

	$.append($$anchor, svg);
};

const archive = ($$anchor) => {
	var svg_1 = root_1();

	$.append($$anchor, svg_1);
};

const profile = ($$anchor) => {
	var svg_2 = root_2();

	$.append($$anchor, svg_2);
};

const search = ($$anchor) => {
	var svg_3 = root_3();

	$.append($$anchor, svg_3);
};

const settings = ($$anchor) => {
	var svg_4 = root_4();

	$.append($$anchor, svg_4);
};

var root = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`);
var root_1 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`);
var root_2 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);
var root_3 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`);
var root_4 = $.from_svg(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`);
var root_5 = $.from_html(`<div class="demo-fill svelte-1itedfe" aria-hidden="true"></div>`);
var root_6 = $.from_html(`<div class="demo-fill svelte-1itedfe" aria-hidden="true"><!></div>`);
var root_7 = $.from_html(`<div class="demo-fill demo-shiny-wrap svelte-1itedfe"><!></div>`);
var root_8 = $.from_html(`<div class="demo-fill demo-dock-wrap svelte-1itedfe"><div class="demo-dock-stage svelte-1itedfe"><!></div></div>`);

export default function DemoPlaceholder($$anchor, $$props) {
	$.push($$props, true);

	const active = $.prop($$props, 'active', 3, false);

	const loaders = {
		shapegrid: () => import('$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte'),
		magicrings: () => import('$lib/components/library/Animations/MagicRings/MagicRings.svelte'),
		shinytext: () => import('$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte'),
		dock: () => import('$lib/components/library/Components/Dock/Dock.svelte')
	};

	let loadedVariant = $.state(null);
	let LoadedComponent = $.state(null);

	$.user_effect(() => {
		if (!active() || $.get(loadedVariant) === $$props.variant) return;

		const loadingVariant = $$props.variant;

		loaders[loadingVariant]().then((module) => {
			if ($$props.variant !== loadingVariant) return;

			$.set(LoadedComponent, module.default, true);
			$.set(loadedVariant, loadingVariant, true);
		});
	});

	const dockItems = [
		{ label: 'Home', icon: home, onClick: () => {} },
		{ label: 'Archive', icon: archive, onClick: () => {} },
		{ label: 'Search', icon: search, onClick: () => {} },
		{ label: 'Profile', icon: profile, onClick: () => {} },
		{ label: 'Settings', icon: settings, onClick: () => {} }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_5();

			$.append($$anchor, div);
		};

		var consequent_1 = ($$anchor) => {
			var div_1 = root_6();
			var node_1 = $.child(div_1);

			$.component(node_1, () => $.get(LoadedComponent), ($$anchor, LoadedComponent_1) => {
				LoadedComponent_1($$anchor, {
					shape: 'hexagon',
					direction: 'diagonal',
					speed: 0.6,
					borderColor: 'rgba(255, 138, 76, 0.18)',
					hoverFillColor: 'rgba(255, 62, 0, 0.6)',
					squareSize: 26,
					hoverTrailAmount: 4
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var consequent_2 = ($$anchor) => {
			var div_2 = root_6();
			var node_2 = $.child(div_2);

			$.component(node_2, () => $.get(LoadedComponent), ($$anchor, LoadedComponent_2) => {
				LoadedComponent_2($$anchor, {
					color: '#FF3E00',
					colorTwo: '#FF8A4C',
					ringCount: 6,
					lineThickness: 1.6,
					baseRadius: 0.32,
					radiusStep: 0.09,
					noiseAmount: 0.08,
					followMouse: true,
					hoverScale: 1.15,
					parallax: 0.04
				});
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var consequent_3 = ($$anchor) => {
			var div_3 = root_7();
			var node_3 = $.child(div_3);

			$.component(node_3, () => $.get(LoadedComponent), ($$anchor, LoadedComponent_3) => {
				LoadedComponent_3($$anchor, {
					text: 'Shiny Text',
					speed: 3,
					color: '#666',
					shineColor: '#fff',
					class: 'demo-shiny-text'
				});
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		var consequent_4 = ($$anchor) => {
			var div_4 = root_8();
			var div_5 = $.child(div_4);
			var node_4 = $.child(div_5);

			$.component(node_4, () => $.get(LoadedComponent), ($$anchor, LoadedComponent_4) => {
				LoadedComponent_4($$anchor, {
					get items() {
						return dockItems;
					},
					panelHeight: 64,
					baseItemSize: 42,
					magnification: 64,
					distance: 140
				});
			});

			$.reset(div_5);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if (!$.get(LoadedComponent)) $$render(consequent); else if ($$props.variant === 'shapegrid') $$render(consequent_1, 1); else if ($$props.variant === 'magicrings') $$render(consequent_2, 2); else if ($$props.variant === 'shinytext') $$render(consequent_3, 3); else if ($$props.variant === 'dock') $$render(consequent_4, 4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}