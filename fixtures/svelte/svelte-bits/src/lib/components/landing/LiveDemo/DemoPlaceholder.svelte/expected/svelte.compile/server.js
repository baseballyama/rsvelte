import * as $ from 'svelte/internal/server';

function home($$renderer) {
	$$renderer.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`);
}

function archive($$renderer) {
	$$renderer.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`);
}

function profile($$renderer) {
	$$renderer.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`);
}

function search($$renderer) {
	$$renderer.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`);
}

function settings($$renderer) {
	$$renderer.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`);
}

export default function DemoPlaceholder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { variant, active = false } = $$props;

		const loaders = {
			shapegrid: () => import('$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte'),
			magicrings: () => import('$lib/components/library/Animations/MagicRings/MagicRings.svelte'),
			shinytext: () => import('$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte'),
			dock: () => import('$lib/components/library/Components/Dock/Dock.svelte')
		};

		let loadedVariant = null;
		let LoadedComponent = null;

		const dockItems = [
			{ label: 'Home', icon: home, onClick: () => {} },
			{ label: 'Archive', icon: archive, onClick: () => {} },
			{ label: 'Search', icon: search, onClick: () => {} },
			{ label: 'Profile', icon: profile, onClick: () => {} },
			{ label: 'Settings', icon: settings, onClick: () => {} }
		];

		if (!LoadedComponent) {
			$$renderer.push(`<!--[0--><div class="demo-fill svelte-1itedfe" aria-hidden="true"></div>`);
		} else if (variant === 'shapegrid') {
			$$renderer.push(`<!--[1--><div class="demo-fill svelte-1itedfe" aria-hidden="true">`);

			if (LoadedComponent) {
				$$renderer.push('<!--[-->');

				LoadedComponent($$renderer, {
					shape: 'hexagon',
					direction: 'diagonal',
					speed: 0.6,
					borderColor: 'rgba(255, 138, 76, 0.18)',
					hoverFillColor: 'rgba(255, 62, 0, 0.6)',
					squareSize: 26,
					hoverTrailAmount: 4
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else if (variant === 'magicrings') {
			$$renderer.push(`<!--[2--><div class="demo-fill svelte-1itedfe" aria-hidden="true">`);

			if (LoadedComponent) {
				$$renderer.push('<!--[-->');

				LoadedComponent($$renderer, {
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else if (variant === 'shinytext') {
			$$renderer.push(`<!--[3--><div class="demo-fill demo-shiny-wrap svelte-1itedfe">`);

			if (LoadedComponent) {
				$$renderer.push('<!--[-->');

				LoadedComponent($$renderer, {
					text: 'Shiny Text',
					speed: 3,
					color: '#666',
					shineColor: '#fff',
					class: 'demo-shiny-text'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else if (variant === 'dock') {
			$$renderer.push(`<!--[4--><div class="demo-fill demo-dock-wrap svelte-1itedfe"><div class="demo-dock-stage svelte-1itedfe">`);

			if (LoadedComponent) {
				$$renderer.push('<!--[-->');

				LoadedComponent($$renderer, {
					items: dockItems,
					panelHeight: 64,
					baseItemSize: 42,
					magnification: 64,
					distance: 140
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}