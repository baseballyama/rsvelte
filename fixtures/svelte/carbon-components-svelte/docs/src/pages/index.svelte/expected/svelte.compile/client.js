import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Column, Content, Grid, Row, Stack, Text } from "carbon-components-svelte";
import Apps from "carbon-icons-svelte/lib/Apps.svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";
import Connect from "carbon-icons-svelte/lib/Connect.svelte";
import ConnectionSignal from "carbon-icons-svelte/lib/ConnectionSignal.svelte";
import DataStructured from "carbon-icons-svelte/lib/DataStructured.svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";
import List from "carbon-icons-svelte/lib/List.svelte";
import Popup from "carbon-icons-svelte/lib/Popup.svelte";
import Replicate from "carbon-icons-svelte/lib/Replicate.svelte";
import Settings from "carbon-icons-svelte/lib/Settings.svelte";
import Template from "carbon-icons-svelte/lib/Template.svelte";
import Types from "carbon-icons-svelte/lib/Types.svelte";
import DocBenefitGrid from "../components/DocBenefitGrid.svelte";
import DocFooterCta from "../components/DocFooterCta.svelte";
import DocHero from "../components/DocHero.svelte";
import HomePageActions from "../components/HomePageActions.svelte";
import DocMetric from "../components/DocMetric.svelte";
import DocSection from "../components/DocSection.svelte";
import DocSectionHeader from "../components/DocSectionHeader.svelte";
import DocSplitRow from "../components/DocSplitRow.svelte";
import TileCard from "../components/TileCard.svelte";

var root = $.from_html(`<meta name="description" content="The Svelte implementation of the Carbon Design System featuring accessible UI components, icons, pictograms, and charts."/> <link rel="canonical" href="https://svelte.carbondesignsystem.com/"/>`, 1);
var root_1 = $.from_html(`The Carbon Design System,<br/>built for Svelte`, 1);
var root_2 = $.from_html(`<div class="metrics-grid"><!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div><!> <!> <!></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Pages($$anchor) {
	const principles = [
		{
			icon: Replicate,
			title: "Reuse",
			body: "Compose interfaces from primitives that already handle state, keyboard interaction, and focus management."
		},

		{
			icon: Template,
			title: "Consistency",
			body: "Every component speaks the same type scale, spacing, and color tokens, so screens feel like one product."
		},

		{
			icon: Settings,
			title: "Extensibility",
			body: "Restyle with design tokens, swap themes at runtime, and extend components with slots and forwarded props."
		}
	];

	const apiBenefits = [
		{
			icon: Apps,
			title: "Component composition",
			body: "Build complex UI from small, composable parts. Slots and nested components keep markup declarative."
		},

		{
			icon: Types,
			title: "TypeScript generics",
			body: "Data-driven components like DataTable are generic over your row types, so data and cells stay type-safe end to end."
		},

		{
			icon: Edit,
			title: "Slots for customization",
			body: "Named slots let you override any part of a component, from a table cell to an empty state, without forking it."
		},

		{
			icon: Connect,
			title: "Events and bindings",
			body: "Dispatched events and two-way bindings keep wiring minimal. No extra stores or boilerplate required."
		}
	];

	const perfBenefits = [
		{
			icon: List,
			title: "Built-in virtualization",
			body: "Render only the rows in view, so long lists and tables stay responsive on large datasets."
		},

		{
			icon: DataStructured,
			title: "Optimized data structures",
			body: "Large in-memory datasets use structures tuned for fast lookups, sorting, and updates."
		},

		{
			icon: ConnectionSignal,
			title: "Pooled event listeners",
			body: "Shared, pooled listeners replace per-item handlers to cut memory use and setup cost."
		},

		{
			icon: Popup,
			title: "Floating portal",
			body: "Tooltips, menus, and dialogs render through a floating portal to escape overflow and stacking contexts."
		}
	];

	const benefitSections = [
		{ heading: "The Svelte way", items: apiBenefits },
		{ heading: "Fast at scale", items: perfBenefits }
	];

	$.head('kcomuu', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'Carbon Components Svelte';
		});

		$.append($$anchor, fragment);
	});

	Content($$anchor, {
		class: 'overview-page',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_5();
			var node = $.first_child(fragment_2);

			DocHero(node, {
				eyebrow: 'Carbon Components Svelte',
				get icon() {
					return Carbon;
				},
				description: 'A complete component library that implements the IBM Carbon Design System. Ship accessible, consistent, production-ready interfaces.',
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						Text($$anchor, {
							tag: 'h1',
							type: 'expressive-heading-06',
							color: 'primary',
							balance: true,
							maxWidth: '55rem',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_4 = root_1();

								$.next(2);
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},

					actions: ($$anchor, $$slotProps) => {
						HomePageActions($$anchor, {});
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			DocSection(node_1, {
				variant: 'metrics',
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Row($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Column($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div = root_2();
											var node_2 = $.child(div);

											DocMetric(node_2, {
												value: '90+',
												label: 'Components',
												caption: 'From inputs to data tables'
											});

											var node_3 = $.sibling(node_2, 2);

											DocMetric(node_3, {
												value: '5',
												label: 'Built-in themes',
												caption: 'Two light, three dark'
											});

											var node_4 = $.sibling(node_3, 2);

											DocMetric(node_4, {
												value: 'TypeScript',
												label: 'Fully typed API',
												caption: 'Props, events, and slots'
											});

											var node_5 = $.sibling(node_4, 2);

											DocMetric(node_5, {
												value: 'WCAG 2.1 AA',
												label: 'Accessibility',
												caption: 'Keyboard and screen-reader ready'
											});

											$.reset(div);
											$.append($$anchor, div);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_1, 2);

			DocSection(node_6, {
				variant: 'foundation',
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_3();
							var node_7 = $.first_child(fragment_10);

							DocSectionHeader(node_7, {
								title: 'The full design system',
								titleType: 'productive-heading-06',
								gap: 6,
								maxWidth: '62ch',
								wide: true,
								balance: true,
								description: 'A design system is a shared language — the guidelines, patterns, and reusable parts that keep teams aligned as products grow. Carbon is IBM\'s, proven across thousands of enterprise screens. Carbon Components Svelte ships it as real Svelte components, so accessibility, theming, and visual consistency come standard.'
							});

							var node_8 = $.sibling(node_7, 2);

							$.each(node_8, 17, () => principles, (principle) => principle.title, ($$anchor, principle) => {
								DocSplitRow($$anchor, {
									variant: 'principle',
									get icon() {
										return $.get(principle).icon;
									},

									get title() {
										return $.get(principle).title;
									},

									get description() {
										return $.get(principle).body;
									}
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			DocSection(node_9, {
				variant: 'foundation',
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_3();
							var node_10 = $.first_child(fragment_13);

							DocSectionHeader(node_10, {
								title: 'Engineered for Svelte',
								titleType: 'productive-heading-06',
								gap: 6,
								maxWidth: '62ch',
								wide: true,
								balance: true,
								description: 'Two-way bindings, slot composition, and compile-time reactivity keep the runtime small. Minimal boilerplate and performance tuned for data-heavy applications.'
							});

							var node_11 = $.sibling(node_10, 2);

							$.each(node_11, 17, () => benefitSections, (section) => section.heading, ($$anchor, section) => {
								Row($$anchor, {
									class: 'principle-row',
									children: ($$anchor, $$slotProps) => {
										Column($$anchor, {
											children: ($$anchor, $$slotProps) => {
												Stack($$anchor, {
													gap: 6,
													children: ($$anchor, $$slotProps) => {
														var fragment_17 = root_3();
														var node_12 = $.first_child(fragment_17);

														Text(node_12, {
															tag: 'h3',
															type: 'productive-heading-03',
															color: 'primary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $.get(section).heading));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});

														var node_13 = $.sibling(node_12, 2);

														DocBenefitGrid(node_13, {
															get items() {
																return $.get(section).items;
															}
														});

														$.append($$anchor, fragment_17);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_9, 2);

			DocSection(node_14, {
				variant: 'ecosystem',
				children: ($$anchor, $$slotProps) => {
					Grid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root_3();
							var node_15 = $.first_child(fragment_20);

							Row(node_15, {
								children: ($$anchor, $$slotProps) => {
									Column($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Text($$anchor, {
												tag: 'div',
												type: 'caption-02',
												color: 'secondary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('GitHub repositories');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_15, 2);

							Row(node_16, {
								class: 'ecosystem-row',
								children: ($$anchor, $$slotProps) => {
									Column($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div_1 = root_4();
											var node_17 = $.child(div_1);

											Row(node_17, {
												noGutter: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_24 = root_3();
													var node_18 = $.first_child(fragment_24);

													Column(node_18, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$anchor, $$slotProps) => {
															TileCard($$anchor, {
																borderRight: true,
																borderBottom: true,
																title: 'Carbon Components Svelte',
																subtitle: '90+ components',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-components-svelte'
															});
														},
														$$slots: { default: true }
													});

													var node_19 = $.sibling(node_18, 2);

													Column(node_19, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$anchor, $$slotProps) => {
															TileCard($$anchor, {
																borderBottom: true,
																title: 'Carbon Icons Svelte',
																subtitle: '2,700+ icons',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-icons-svelte'
															});
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_24);
												},
												$$slots: { default: true }
											});

											var node_20 = $.sibling(node_17, 2);

											Row(node_20, {
												noGutter: true,
												children: ($$anchor, $$slotProps) => {
													var fragment_27 = root_3();
													var node_21 = $.first_child(fragment_27);

													Column(node_21, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$anchor, $$slotProps) => {
															TileCard($$anchor, {
																borderBottom: true,
																borderRight: true,
																title: 'Carbon Pictograms Svelte',
																subtitle: '1,500+ pictograms',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-pictograms-svelte'
															});
														},
														$$slots: { default: true }
													});

													var node_22 = $.sibling(node_21, 2);

													Column(node_22, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$anchor, $$slotProps) => {
															TileCard($$anchor, {
																borderBottom: true,
																title: 'Carbon Charts Svelte',
																subtitle: '25+ charts, powered by d3',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-charts/tree/master/packages/svelte'
															});
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_27);
												},
												$$slots: { default: true }
											});

											var node_23 = $.sibling(node_20, 2);

											Row(node_23, {
												noGutter: true,
												children: ($$anchor, $$slotProps) => {
													Column($$anchor, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$anchor, $$slotProps) => {
															TileCard($$anchor, {
																title: 'Carbon Preprocess Svelte',
																subtitle: 'Collection of Carbon Svelte preprocessors',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-preprocess-svelte'
															});
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});

											$.reset(div_1);
											$.append($$anchor, div_1);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_14, 2);

			DocFooterCta(node_24, {
				title: 'Start building with Carbon',
				description: 'Install the library, apply a theme, and compose your first screen in minutes.',
				$$slots: {
					actions: ($$anchor, $$slotProps) => {
						HomePageActions($$anchor, {});
					}
				}
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});
}