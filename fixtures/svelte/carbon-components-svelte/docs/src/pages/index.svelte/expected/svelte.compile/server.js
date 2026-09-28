import * as $ from 'svelte/internal/server';
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

export default function Pages($$renderer) {
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

	$.head('kcomuu', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Carbon Components Svelte</title>`);
		});

		$$renderer.push(`<meta name="description" content="The Svelte implementation of the Carbon Design System featuring accessible UI components, icons, pictograms, and charts."/> <link rel="canonical" href="https://svelte.carbondesignsystem.com/"/>`);
	});

	Content($$renderer, {
		class: 'overview-page',
		children: ($$renderer) => {
			DocHero($$renderer, {
				eyebrow: 'Carbon Components Svelte',
				icon: Carbon,
				description: 'A complete component library that implements the IBM Carbon Design System. Ship accessible, consistent, production-ready interfaces.',
				$$slots: {
					title: ($$renderer) => {
						{
							Text($$renderer, {
								tag: 'h1',
								type: 'expressive-heading-06',
								color: 'primary',
								balance: true,
								maxWidth: '55rem',
								children: ($$renderer) => {
									$$renderer.push(`<!---->The Carbon Design System,<br/>built for Svelte`);
								},
								$$slots: { default: true }
							});
						}
					},

					actions: ($$renderer) => {
						{
							HomePageActions($$renderer, {});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			DocSection($$renderer, {
				variant: 'metrics',
				children: ($$renderer) => {
					Grid($$renderer, {
						children: ($$renderer) => {
							Row($$renderer, {
								children: ($$renderer) => {
									Column($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="metrics-grid">`);

											DocMetric($$renderer, {
												value: '90+',
												label: 'Components',
												caption: 'From inputs to data tables'
											});

											$$renderer.push(`<!----> `);

											DocMetric($$renderer, {
												value: '5',
												label: 'Built-in themes',
												caption: 'Two light, three dark'
											});

											$$renderer.push(`<!----> `);

											DocMetric($$renderer, {
												value: 'TypeScript',
												label: 'Fully typed API',
												caption: 'Props, events, and slots'
											});

											$$renderer.push(`<!----> `);

											DocMetric($$renderer, {
												value: 'WCAG 2.1 AA',
												label: 'Accessibility',
												caption: 'Keyboard and screen-reader ready'
											});

											$$renderer.push(`<!----></div>`);
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

			$$renderer.push(`<!----> `);

			DocSection($$renderer, {
				variant: 'foundation',
				children: ($$renderer) => {
					Grid($$renderer, {
						children: ($$renderer) => {
							DocSectionHeader($$renderer, {
								title: 'The full design system',
								titleType: 'productive-heading-06',
								gap: 6,
								maxWidth: '62ch',
								wide: true,
								balance: true,
								description: 'A design system is a shared language — the guidelines, patterns, and reusable parts that keep teams aligned as products grow. Carbon is IBM\'s, proven across thousands of enterprise screens. Carbon Components Svelte ships it as real Svelte components, so accessibility, theming, and visual consistency come standard.'
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(principles);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let principle = each_array[$$index];

								DocSplitRow($$renderer, {
									variant: 'principle',
									icon: principle.icon,
									title: principle.title,
									description: principle.body
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DocSection($$renderer, {
				variant: 'foundation',
				children: ($$renderer) => {
					Grid($$renderer, {
						children: ($$renderer) => {
							DocSectionHeader($$renderer, {
								title: 'Engineered for Svelte',
								titleType: 'productive-heading-06',
								gap: 6,
								maxWidth: '62ch',
								wide: true,
								balance: true,
								description: 'Two-way bindings, slot composition, and compile-time reactivity keep the runtime small. Minimal boilerplate and performance tuned for data-heavy applications.'
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array_1 = $.ensure_array_like(benefitSections);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let section = each_array_1[$$index_1];

								Row($$renderer, {
									class: 'principle-row',
									children: ($$renderer) => {
										Column($$renderer, {
											children: ($$renderer) => {
												Stack($$renderer, {
													gap: 6,
													children: ($$renderer) => {
														Text($$renderer, {
															tag: 'h3',
															type: 'productive-heading-03',
															color: 'primary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(section.heading)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														DocBenefitGrid($$renderer, { items: section.items });
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DocSection($$renderer, {
				variant: 'ecosystem',
				children: ($$renderer) => {
					Grid($$renderer, {
						children: ($$renderer) => {
							Row($$renderer, {
								children: ($$renderer) => {
									Column($$renderer, {
										children: ($$renderer) => {
											Text($$renderer, {
												tag: 'div',
												type: 'caption-02',
												color: 'secondary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->GitHub repositories`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Row($$renderer, {
								class: 'ecosystem-row',
								children: ($$renderer) => {
									Column($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div>`);

											Row($$renderer, {
												noGutter: true,
												children: ($$renderer) => {
													Column($$renderer, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$renderer) => {
															TileCard($$renderer, {
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

													$$renderer.push(`<!----> `);

													Column($$renderer, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$renderer) => {
															TileCard($$renderer, {
																borderBottom: true,
																title: 'Carbon Icons Svelte',
																subtitle: '2,700+ icons',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-icons-svelte'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Row($$renderer, {
												noGutter: true,
												children: ($$renderer) => {
													Column($$renderer, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$renderer) => {
															TileCard($$renderer, {
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

													$$renderer.push(`<!----> `);

													Column($$renderer, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$renderer) => {
															TileCard($$renderer, {
																borderBottom: true,
																title: 'Carbon Charts Svelte',
																subtitle: '25+ charts, powered by d3',
																target: '_blank',
																href: 'https://github.com/carbon-design-system/carbon-charts/tree/master/packages/svelte'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Row($$renderer, {
												noGutter: true,
												children: ($$renderer) => {
													Column($$renderer, {
														xlg: 5,
														lg: 8,
														md: 4,
														children: ($$renderer) => {
															TileCard($$renderer, {
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

											$$renderer.push(`<!----></div>`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DocFooterCta($$renderer, {
				title: 'Start building with Carbon',
				description: 'Install the library, apply a theme, and compose your first screen in minutes.',
				$$slots: {
					actions: ($$renderer) => {
						{
							HomePageActions($$renderer, {});
						}
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}