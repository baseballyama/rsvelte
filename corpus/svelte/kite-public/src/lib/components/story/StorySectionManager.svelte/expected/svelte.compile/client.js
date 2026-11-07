import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { sections } from '$lib/stores/sections.svelte.js';
import { aggregateCitationsFromTexts } from '$lib/utils/citationAggregator';
import { buildCitationMapping, replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import CitationTooltip from './CitationTooltip.svelte';
import StoryActionItems from './StoryActionItems.svelte';
import StoryDidYouKnow from './StoryDidYouKnow.svelte';
import StoryHighlights from './StoryHighlights.svelte';
import StoryImage from './StoryImage.svelte';
import StoryInternationalReactions from './StoryInternationalReactions.svelte';
import StoryListSection from './StoryListSection.svelte';
import StoryPerspectives from './StoryPerspectives.svelte';
import StoryQuote from './StoryQuote.svelte';
import StorySources from './StorySources.svelte';
import StorySuggestedQnA from './StorySuggestedQnA.svelte';
import StorySummary from './StorySummary.svelte';
import StoryTextSection from './StoryTextSection.svelte';
import StoryTimeline from './StoryTimeline.svelte';

var root = $.from_html(`<p class="mb-4 text-base text-gray-700 dark:text-gray-300"><!></p>`);
var root_1 = $.from_html(`<li><!></li>`);
var root_2 = $.from_html(`<ul class="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300"></ul>`);
var root_3 = $.from_html(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <!> <!> <!></section>`);

export default function StorySectionManager($$anchor, $$props) {
	$.push($$props, true);

	// Helper to extract domain from a URL for image attribution fallback
	function extractDomain(url) {
		if (!url) return '';

		try {
			return new URL(url).hostname;
		} catch {
			return '';
		}
	}

	// Props
	let imagesPreloaded = $.prop($$props, 'imagesPreloaded', 3, false),
		showSourceOverlay = $.prop($$props, 'showSourceOverlay', 15, false),
		currentSource = $.prop($$props, 'currentSource', 15, null),
		sourceArticles = $.prop($$props, 'sourceArticles', 31, () => $.proxy([])),
		currentMediaInfo = $.prop($$props, 'currentMediaInfo', 15, null),
		isLoadingMediaInfo = $.prop($$props, 'isLoadingMediaInfo', 15, false),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s // Use regular localization if not provided
		),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Get enabled sections in the correct order
	const enabledSections = $.derived(() => sections.list.filter((section) => section.enabled).sort((a, b) => a.order - b.order));

	// Check if a section has content
	function hasContent(sectionId) {
		switch (sectionId) {
			case 'summary':
				return !!$$props.story.short_summary;

			case 'primaryImage':
				// Use new primary_image field if available, fallback to first article with image
				return !!$$props.story.primary_image || !!$$props.story.articles?.find((a) => a.image);

			case 'highlights':
				return !!$$props.story.talking_points?.length;

			case 'quotes':
				return !!$$props.story.quote;

			case 'secondaryImage':
				// Use new secondary_image field if available, fallback to checking if we have 2+ articles with images
				return !!$$props.story.secondary_image || ($$props.story.articles?.filter((a) => a.image)?.length ?? 0) >= 2;

			case 'perspectives':
				return !!$$props.story.perspectives?.length;

			case 'historicalBackground':
				return !!$$props.story.historical_background;

			case 'humanitarianImpact':
				return !!$$props.story.humanitarian_impact;

			case 'technicalDetails':
				return !!$$props.story.technical_details?.length;

			case 'businessAngle':
				return !!($$props.story.business_angle_text || $$props.story.business_angle_points?.length);

			case 'scientificSignificance':
				return !!$$props.story.scientific_significance?.length;

			case 'travelAdvisory':
				return !!$$props.story.travel_advisory?.length;

			case 'performanceStatistics':
				return !!$$props.story.performance_statistics?.length;

			case 'leagueStandings':
				return !!$$props.story.league_standings;

			case 'designPrinciples':
				return !!$$props.story.design_principles;

			case 'userExperienceImpact':
				return !!$$props.story.user_experience_impact?.length;

			case 'gameplayMechanics':
				return !!$$props.story.gameplay_mechanics?.length;

			case 'industryImpact':
				return !!$$props.story.gaming_industry_impact?.length;

			case 'technicalSpecifications':
				return !!$$props.story.technical_specifications;

			case 'timeline':
				return !!$$props.story.timeline?.length;

			case 'internationalReactions':
				return !!$$props.story.international_reactions?.length;

			case 'suggestedQnA':
				return !!$$props.story.suggested_qna?.length;

			case 'actionItems':
				return !!$$props.story.user_action_items?.length;

			case 'didYouKnow':
				return !!$$props.story.did_you_know;

			case 'sources':
				return !!$$props.story.domains?.length;

			default:
				return false;
		}
	}

	// Get the sections to render (enabled and have content)
	const sectionsToRender = $.derived(() => $.get(enabledSections).filter((section) => hasContent(section.id)));

	// Build global citation mapping for the story
	const citationMapping = $.derived(() => {
		return buildCitationMapping($$props.story, $$props.story.articles || []);
	});

	// Shared tooltip reference for business angle section
	let businessAngleCitationTooltip = $.state(void 0);

	// Get all cited articles from business angle section
	const businessAngleCitedArticles = $.derived(() => {
		const texts = [];

		if ($$props.story.business_angle_text) {
			texts.push($.get(citationMapping)
				? replaceWithNumberedCitations($$props.story.business_angle_text, $.get(citationMapping))
				: $$props.story.business_angle_text);
		}

		if ($$props.story.business_angle_points?.length > 0) {
			$$props.story.business_angle_points.forEach((point) => {
				texts.push($.get(citationMapping)
					? replaceWithNumberedCitations(point, $.get(citationMapping))
					: point);
			});
		}

		return aggregateCitationsFromTexts(texts, $.get(citationMapping), $$props.story.articles || []);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(sectionsToRender), $.index, ($$anchor, section) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				StorySummary($$anchor, {
					get story() {
						return $$props.story;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_3 = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				{
					var consequent_1 = ($$anchor) => {
						const sourceArticle = $.derived(() => $$props.story.articles?.find((a) => a.image === $$props.story.primary_image.url));

						{
							let $0 = $.derived(() => ({
								image: $$props.story.primary_image.url,
								image_caption: $$props.story.primary_image.caption,
								link: $.get(sourceArticle)?.link || $$props.story.primary_image.link,
								domain: $$props.story.primary_image.credit || $.get(sourceArticle)?.domain || extractDomain($$props.story.primary_image.link)
							}));

							StoryImage($$anchor, {
								get article() {
									return $.get($0);
								},

								get imagesPreloaded() {
									return imagesPreloaded();
								},
								showCaption: true,
								get flashcardMode() {
									return flashcardMode();
								},

								get selectedWords() {
									return selectedWords();
								},

								get shouldJiggle() {
									return shouldJiggle();
								},

								get onWordClick() {
									return $$props.onWordClick;
								}
							});
						}
					};

					var alternate = ($$anchor) => {
						const imageArticle = $.derived(() => $$props.story.articles?.find((a) => a.image));
						var fragment_5 = $.comment();
						var node_3 = $.first_child(fragment_5);

						{
							var consequent_2 = ($$anchor) => {
								StoryImage($$anchor, {
									get article() {
										return $.get(imageArticle);
									},

									get imagesPreloaded() {
										return imagesPreloaded();
									},

									get flashcardMode() {
										return flashcardMode();
									},

									get selectedWords() {
										return selectedWords();
									},

									get selectedPhrases() {
										return selectedPhrases();
									},

									get shouldJiggle() {
										return shouldJiggle();
									},

									get onWordClick() {
										return $$props.onWordClick;
									}
								});
							};

							$.if(node_3, ($$render) => {
								if ($.get(imageArticle)) $$render(consequent_2);
							});
						}

						$.append($$anchor, fragment_5);
					};

					$.if(node_2, ($$render) => {
						if ($$props.story.primary_image) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_3);
			};

			var consequent_4 = ($$anchor) => {
				StoryHighlights($$anchor, {
					get points() {
						return $$props.story.talking_points;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_5 = ($$anchor) => {
				StoryQuote($$anchor, {
					get quote() {
						return $$props.story.quote;
					},

					get author() {
						return $$props.story.quote_author;
					},

					get attribution() {
						return $$props.story.quote_attribution;
					},

					get sourceUrl() {
						return $$props.story.quote_source_url;
					},

					get sourceDomain() {
						return $$props.story.quote_source_domain;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_8 = ($$anchor) => {
				var fragment_9 = $.comment();
				var node_4 = $.first_child(fragment_9);

				{
					var consequent_6 = ($$anchor) => {
						const sourceArticle = $.derived(() => $$props.story.articles?.find((a) => a.image === $$props.story.secondary_image.url));

						{
							let $0 = $.derived(() => ({
								image: $$props.story.secondary_image.url,
								image_caption: $$props.story.secondary_image.caption,
								link: $.get(sourceArticle)?.link || $$props.story.secondary_image.link,
								domain: $$props.story.secondary_image.credit || $.get(sourceArticle)?.domain || extractDomain($$props.story.secondary_image.link)
							}));

							StoryImage($$anchor, {
								get article() {
									return $.get($0);
								},

								get imagesPreloaded() {
									return imagesPreloaded();
								},
								showCaption: true,
								get flashcardMode() {
									return flashcardMode();
								},

								get selectedWords() {
									return selectedWords();
								},

								get shouldJiggle() {
									return shouldJiggle();
								},

								get onWordClick() {
									return $$props.onWordClick;
								}
							});
						}
					};

					var alternate_1 = ($$anchor) => {
						const secondaryImage = $.derived(() => $$props.story.articles?.filter((a) => a.image)[1]);
						var fragment_11 = $.comment();
						var node_5 = $.first_child(fragment_11);

						{
							var consequent_7 = ($$anchor) => {
								StoryImage($$anchor, {
									get article() {
										return $.get(secondaryImage);
									},

									get imagesPreloaded() {
										return imagesPreloaded();
									},

									get flashcardMode() {
										return flashcardMode();
									},

									get selectedWords() {
										return selectedWords();
									},

									get selectedPhrases() {
										return selectedPhrases();
									},

									get shouldJiggle() {
										return shouldJiggle();
									},

									get onWordClick() {
										return $$props.onWordClick;
									}
								});
							};

							$.if(node_5, ($$render) => {
								if ($.get(secondaryImage)) $$render(consequent_7);
							});
						}

						$.append($$anchor, fragment_11);
					};

					$.if(node_4, ($$render) => {
						if ($$props.story.secondary_image) $$render(consequent_6); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_9);
			};

			var consequent_9 = ($$anchor) => {
				StoryPerspectives($$anchor, {
					get perspectives() {
						return $$props.story.perspectives;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_10 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.historicalBackground") || "Historical Background");

					StoryTextSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get content() {
							return $$props.story.historical_background;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'historical_background'
					});
				}
			};

			var consequent_11 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.humanitarianImpact") || "Humanitarian Impact");

					StoryTextSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get content() {
							return $$props.story.humanitarian_impact;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'humanitarian_impact'
					});
				}
			};

			var consequent_12 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.technicalDetails") || "Technical Details");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.technical_details;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'technical_details'
					});
				}
			};

			var consequent_15 = ($$anchor) => {
				var section_1 = root_3();
				var h3 = $.child(section_1);
				var text = $.only_child(h3, true);
				var node_6 = $.sibling(h3, 2);

				{
					var consequent_13 = ($$anchor) => {
						var p = root();
						var node_7 = $.child(p);

						{
							let $0 = $.derived(() => $.get(citationMapping)
								? replaceWithNumberedCitations($$props.story.business_angle_text, $.get(citationMapping))
								: $$props.story.business_angle_text);

							CitationText(node_7, {
								get text() {
									return $.get($0);
								},
								showFavicons: false,
								showNumbers: false,
								inline: false,
								get articles() {
									return $.get(businessAngleCitedArticles).citedArticles;
								},

								get citationMapping() {
									return $.get(citationMapping);
								},

								get citationTooltip() {
									return $.get(businessAngleCitationTooltip);
								},

								get storyLocalizer() {
									return storyLocalizer();
								}
							});
						}

						$.reset(p);
						$.append($$anchor, p);
					};

					$.if(node_6, ($$render) => {
						if ($$props.story.business_angle_text) $$render(consequent_13);
					});
				}

				var node_8 = $.sibling(node_6, 2);

				{
					var consequent_14 = ($$anchor) => {
						var ul = root_2();

						$.each(ul, 21, () => $$props.story.business_angle_points, $.index, ($$anchor, point) => {
							var li = root_1();
							var node_9 = $.child(li);

							{
								let $0 = $.derived(() => $.get(citationMapping)
									? replaceWithNumberedCitations($.get(point), $.get(citationMapping))
									: $.get(point));

								CitationText(node_9, {
									get text() {
										return $.get($0);
									},
									showFavicons: false,
									showNumbers: false,
									inline: true,
									get articles() {
										return $.get(businessAngleCitedArticles).citedArticles;
									},

									get citationMapping() {
										return $.get(citationMapping);
									},

									get citationTooltip() {
										return $.get(businessAngleCitationTooltip);
									},

									get storyLocalizer() {
										return storyLocalizer();
									}
								});
							}

							$.reset(li);
							$.append($$anchor, li);
						});

						$.reset(ul);
						$.append($$anchor, ul);
					};

					$.if(node_8, ($$render) => {
						if ($$props.story.business_angle_points?.length > 0) $$render(consequent_14);
					});
				}

				var node_10 = $.sibling(node_8, 2);

				$.bind_this(
					CitationTooltip(node_10, {
						get articles() {
							return $.get(businessAngleCitedArticles).citedArticles;
						},

						get citationNumbers() {
							return $.get(businessAngleCitedArticles).citedNumbers;
						},

						get hasCommonKnowledge() {
							return $.get(businessAngleCitedArticles).hasCommonKnowledge;
						},

						get citedItems() {
							return $.get(businessAngleCitedArticles).citedItems;
						}
					}),
					($$value) => $.set(businessAngleCitationTooltip, $$value, true),
					() => $.get(businessAngleCitationTooltip)
				);

				$.reset(section_1);

				$.template_effect(($0) => $.set_text(text, $0), [
					() => storyLocalizer()("section.businessAngle") || "Business Angle"
				]);

				$.append($$anchor, section_1);
			};

			var consequent_16 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.scientificSignificance") || "Scientific Significance");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.scientific_significance;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'scientific_significance'
					});
				}
			};

			var consequent_17 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.travelAdvisory") || "Travel Advisory");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.travel_advisory;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'travel_advisory'
					});
				}
			};

			var consequent_18 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.performanceStatistics") || "Performance Statistics");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.performance_statistics;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'performance_statistics'
					});
				}
			};

			var consequent_19 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.leagueStandings") || "League Standings");

					StoryTextSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get content() {
							return $$props.story.league_standings;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'league_standings'
					});
				}
			};

			var consequent_20 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.designPrinciples") || "Design Principles");

					StoryTextSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get content() {
							return $$props.story.design_principles;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'design_principles'
					});
				}
			};

			var consequent_21 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.userExperienceImpact") || "User Experience Impact");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.user_experience_impact;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'user_experience_impact'
					});
				}
			};

			var consequent_22 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.gameplayMechanics") || "Gameplay Mechanics");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.gameplay_mechanics;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'gameplay_mechanics'
					});
				}
			};

			var consequent_23 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.industryImpact") || "Industry Impact");

					StoryListSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get items() {
							return $$props.story.gaming_industry_impact;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'gaming_industry_impact'
					});
				}
			};

			var consequent_24 = ($$anchor) => {
				{
					let $0 = $.derived(() => storyLocalizer()("section.technicalSpecifications") || "Technical Specifications");

					StoryTextSection($$anchor, {
						get title() {
							return $.get($0);
						},

						get content() {
							return $$props.story.technical_specifications;
						},

						get articles() {
							return $$props.story.articles;
						},

						get citationMapping() {
							return $.get(citationMapping);
						},

						get flashcardMode() {
							return flashcardMode();
						},

						get selectedWords() {
							return selectedWords();
						},

						get selectedPhrases() {
							return selectedPhrases();
						},

						get shouldJiggle() {
							return shouldJiggle();
						},

						get onWordClick() {
							return $$props.onWordClick;
						},
						section: 'technical_specifications'
					});
				}
			};

			var consequent_25 = ($$anchor) => {
				StoryTimeline($$anchor, {
					get timeline() {
						return $$props.story.timeline;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_26 = ($$anchor) => {
				StoryInternationalReactions($$anchor, {
					get reactions() {
						return $$props.story.international_reactions;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_27 = ($$anchor) => {
				StorySuggestedQnA($$anchor, {
					get qna() {
						return $$props.story.suggested_qna;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_28 = ($$anchor) => {
				StoryActionItems($$anchor, {
					get actionItems() {
						return $$props.story.user_action_items;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_29 = ($$anchor) => {
				StoryDidYouKnow($$anchor, {
					get content() {
						return $$props.story.did_you_know;
					},

					get articles() {
						return $$props.story.articles;
					},

					get citationMapping() {
						return $.get(citationMapping);
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get flashcardMode() {
						return flashcardMode();
					},

					get selectedWords() {
						return selectedWords();
					},

					get selectedPhrases() {
						return selectedPhrases();
					},

					get shouldJiggle() {
						return shouldJiggle();
					},

					get onWordClick() {
						return $$props.onWordClick;
					}
				});
			};

			var consequent_30 = ($$anchor) => {
				StorySources($$anchor, {
					get domains() {
						return $$props.story.domains;
					},

					get articles() {
						return $$props.story.articles;
					},

					get storyLocalizer() {
						return storyLocalizer();
					},

					get showSourceOverlay() {
						return showSourceOverlay();
					},

					set showSourceOverlay($$value) {
						showSourceOverlay($$value);
					},

					get currentSource() {
						return currentSource();
					},

					set currentSource($$value) {
						currentSource($$value);
					},

					get sourceArticles() {
						return sourceArticles();
					},

					set sourceArticles($$value) {
						sourceArticles($$value);
					},

					get currentMediaInfo() {
						return currentMediaInfo();
					},

					set currentMediaInfo($$value) {
						currentMediaInfo($$value);
					},

					get isLoadingMediaInfo() {
						return isLoadingMediaInfo();
					},

					set isLoadingMediaInfo($$value) {
						isLoadingMediaInfo($$value);
					}
				});
			};

			$.if(node_1, ($$render) => {
				if ($.get(section).id === "summary") $$render(consequent); else if ($.get(section).id === "primaryImage") $$render(consequent_3, 1); else if ($.get(section).id === "highlights") $$render(consequent_4, 2); else if ($.get(section).id === "quotes") $$render(consequent_5, 3); else if ($.get(section).id === "secondaryImage") $$render(consequent_8, 4); else if ($.get(section).id === "perspectives") $$render(consequent_9, 5); else if ($.get(section).id === "historicalBackground") $$render(consequent_10, 6); else if ($.get(section).id === "humanitarianImpact") $$render(consequent_11, 7); else if ($.get(section).id === "technicalDetails") $$render(consequent_12, 8); else if ($.get(section).id === "businessAngle") $$render(consequent_15, 9); else if ($.get(section).id === "scientificSignificance") $$render(consequent_16, 10); else if ($.get(section).id === "travelAdvisory") $$render(consequent_17, 11); else if ($.get(section).id === "performanceStatistics") $$render(consequent_18, 12); else if ($.get(section).id === "leagueStandings") $$render(consequent_19, 13); else if ($.get(section).id === "designPrinciples") $$render(consequent_20, 14); else if ($.get(section).id === "userExperienceImpact") $$render(consequent_21, 15); else if ($.get(section).id === "gameplayMechanics") $$render(consequent_22, 16); else if ($.get(section).id === "industryImpact") $$render(consequent_23, 17); else if ($.get(section).id === "technicalSpecifications") $$render(consequent_24, 18); else if ($.get(section).id === "timeline") $$render(consequent_25, 19); else if ($.get(section).id === "internationalReactions") $$render(consequent_26, 20); else if ($.get(section).id === "suggestedQnA") $$render(consequent_27, 21); else if ($.get(section).id === "actionItems") $$render(consequent_28, 22); else if ($.get(section).id === "didYouKnow") $$render(consequent_29, 23); else if ($.get(section).id === "sources") $$render(consequent_30, 24);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}