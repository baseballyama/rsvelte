import * as $ from 'svelte/internal/server';
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

export default function StorySectionManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let {
			story,
			imagesPreloaded = false,
			showSourceOverlay = false,
			currentSource = null,
			sourceArticles = [],
			currentMediaInfo = null,
			isLoadingMediaInfo = false,
			storyLocalizer = s, // Use regular localization if not provided
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Get enabled sections in the correct order
		const enabledSections = $.derived(() => sections.list.filter((section) => section.enabled).sort((a, b) => a.order - b.order));

		// Check if a section has content
		function hasContent(sectionId) {
			switch (sectionId) {
				case 'summary':
					return !!story.short_summary;

				case 'primaryImage':
					// Use new primary_image field if available, fallback to first article with image
					return !!story.primary_image || !!story.articles?.find((a) => a.image);

				case 'highlights':
					return !!story.talking_points?.length;

				case 'quotes':
					return !!story.quote;

				case 'secondaryImage':
					// Use new secondary_image field if available, fallback to checking if we have 2+ articles with images
					return !!story.secondary_image || (story.articles?.filter((a) => a.image)?.length ?? 0) >= 2;

				case 'perspectives':
					return !!story.perspectives?.length;

				case 'historicalBackground':
					return !!story.historical_background;

				case 'humanitarianImpact':
					return !!story.humanitarian_impact;

				case 'technicalDetails':
					return !!story.technical_details?.length;

				case 'businessAngle':
					return !!(story.business_angle_text || story.business_angle_points?.length);

				case 'scientificSignificance':
					return !!story.scientific_significance?.length;

				case 'travelAdvisory':
					return !!story.travel_advisory?.length;

				case 'performanceStatistics':
					return !!story.performance_statistics?.length;

				case 'leagueStandings':
					return !!story.league_standings;

				case 'designPrinciples':
					return !!story.design_principles;

				case 'userExperienceImpact':
					return !!story.user_experience_impact?.length;

				case 'gameplayMechanics':
					return !!story.gameplay_mechanics?.length;

				case 'industryImpact':
					return !!story.gaming_industry_impact?.length;

				case 'technicalSpecifications':
					return !!story.technical_specifications;

				case 'timeline':
					return !!story.timeline?.length;

				case 'internationalReactions':
					return !!story.international_reactions?.length;

				case 'suggestedQnA':
					return !!story.suggested_qna?.length;

				case 'actionItems':
					return !!story.user_action_items?.length;

				case 'didYouKnow':
					return !!story.did_you_know;

				case 'sources':
					return !!story.domains?.length;

				default:
					return false;
			}
		}

		// Get the sections to render (enabled and have content)
		const sectionsToRender = $.derived(() => enabledSections().filter((section) => hasContent(section.id)));

		// Build global citation mapping for the story
		const citationMapping = $.derived(() => {
			return buildCitationMapping(story, story.articles || []);
		});

		// Shared tooltip reference for business angle section
		let businessAngleCitationTooltip = void 0;

		// Get all cited articles from business angle section
		const businessAngleCitedArticles = $.derived(() => {
			const texts = [];

			if (story.business_angle_text) {
				texts.push(citationMapping()
					? replaceWithNumberedCitations(story.business_angle_text, citationMapping())
					: story.business_angle_text);
			}

			if (story.business_angle_points?.length > 0) {
				story.business_angle_points.forEach((point) => {
					texts.push(citationMapping()
						? replaceWithNumberedCitations(point, citationMapping())
						: point);
				});
			}

			return aggregateCitationsFromTexts(texts, citationMapping(), story.articles || []);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(sectionsToRender());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let section = each_array[$$index_1];

				if (section.id === "summary") {
					$$renderer.push('<!--[0-->');

					StorySummary($$renderer, {
						story,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "primaryImage") {
					$$renderer.push('<!--[1-->');

					if (story.primary_image) {
						$$renderer.push('<!--[0-->');

						const sourceArticle = story.articles?.find((a) => a.image === story.primary_image.url);

						StoryImage($$renderer, {
							article: {
								image: story.primary_image.url,
								image_caption: story.primary_image.caption,
								link: sourceArticle?.link || story.primary_image.link,
								domain: story.primary_image.credit || sourceArticle?.domain || extractDomain(story.primary_image.link)
							},
							imagesPreloaded,
							showCaption: true,
							flashcardMode,
							selectedWords,
							shouldJiggle,
							onWordClick
						});
					} else {
						$$renderer.push('<!--[-1-->');

						const imageArticle = story.articles?.find((a) => a.image);

						if (imageArticle) {
							$$renderer.push('<!--[0-->');

							StoryImage($$renderer, {
								article: imageArticle,
								imagesPreloaded,
								flashcardMode,
								selectedWords,
								selectedPhrases,
								shouldJiggle,
								onWordClick
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else if (section.id === "highlights") {
					$$renderer.push('<!--[2-->');

					StoryHighlights($$renderer, {
						points: story.talking_points,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "quotes") {
					$$renderer.push('<!--[3-->');

					StoryQuote($$renderer, {
						quote: story.quote,
						author: story.quote_author,
						attribution: story.quote_attribution,
						sourceUrl: story.quote_source_url,
						sourceDomain: story.quote_source_domain,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "secondaryImage") {
					$$renderer.push('<!--[4-->');

					if (story.secondary_image) {
						$$renderer.push('<!--[0-->');

						const sourceArticle = story.articles?.find((a) => a.image === story.secondary_image.url);

						StoryImage($$renderer, {
							article: {
								image: story.secondary_image.url,
								image_caption: story.secondary_image.caption,
								link: sourceArticle?.link || story.secondary_image.link,
								domain: story.secondary_image.credit || sourceArticle?.domain || extractDomain(story.secondary_image.link)
							},
							imagesPreloaded,
							showCaption: true,
							flashcardMode,
							selectedWords,
							shouldJiggle,
							onWordClick
						});
					} else {
						$$renderer.push('<!--[-1-->');

						const secondaryImage = story.articles?.filter((a) => a.image)[1];

						if (secondaryImage) {
							$$renderer.push('<!--[0-->');

							StoryImage($$renderer, {
								article: secondaryImage,
								imagesPreloaded,
								flashcardMode,
								selectedWords,
								selectedPhrases,
								shouldJiggle,
								onWordClick
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					$$renderer.push(`<!--]-->`);
				} else if (section.id === "perspectives") {
					$$renderer.push('<!--[5-->');

					StoryPerspectives($$renderer, {
						perspectives: story.perspectives,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "historicalBackground") {
					$$renderer.push('<!--[6-->');

					StoryTextSection($$renderer, {
						title: storyLocalizer("section.historicalBackground") || "Historical Background",
						content: story.historical_background,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'historical_background'
					});
				} else if (section.id === "humanitarianImpact") {
					$$renderer.push('<!--[7-->');

					StoryTextSection($$renderer, {
						title: storyLocalizer("section.humanitarianImpact") || "Humanitarian Impact",
						content: story.humanitarian_impact,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'humanitarian_impact'
					});
				} else if (section.id === "technicalDetails") {
					$$renderer.push('<!--[8-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.technicalDetails") || "Technical Details",
						items: story.technical_details,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'technical_details'
					});
				} else if (section.id === "businessAngle") {
					$$renderer.push(`<!--[9--><section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(storyLocalizer("section.businessAngle") || "Business Angle")}</h3> `);

					if (story.business_angle_text) {
						$$renderer.push(`<!--[0--><p class="mb-4 text-base text-gray-700 dark:text-gray-300">`);

						CitationText($$renderer, {
							text: citationMapping()
								? replaceWithNumberedCitations(story.business_angle_text, citationMapping())
								: story.business_angle_text,
							showFavicons: false,
							showNumbers: false,
							inline: false,
							articles: businessAngleCitedArticles().citedArticles,
							citationMapping: citationMapping(),
							citationTooltip: businessAngleCitationTooltip,
							storyLocalizer
						});

						$$renderer.push(`<!----></p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (story.business_angle_points?.length > 0) {
						$$renderer.push(`<!--[0--><ul class="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300"><!--[-->`);

						const each_array_1 = $.ensure_array_like(story.business_angle_points);

						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
							let point = each_array_1[$$index];

							$$renderer.push(`<li>`);

							CitationText($$renderer, {
								text: citationMapping()
									? replaceWithNumberedCitations(point, citationMapping())
									: point,
								showFavicons: false,
								showNumbers: false,
								inline: true,
								articles: businessAngleCitedArticles().citedArticles,
								citationMapping: citationMapping(),
								citationTooltip: businessAngleCitationTooltip,
								storyLocalizer
							});

							$$renderer.push(`<!----></li>`);
						}

						$$renderer.push(`<!--]--></ul>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					CitationTooltip($$renderer, {
						articles: businessAngleCitedArticles().citedArticles,
						citationNumbers: businessAngleCitedArticles().citedNumbers,
						hasCommonKnowledge: businessAngleCitedArticles().hasCommonKnowledge,
						citedItems: businessAngleCitedArticles().citedItems
					});

					$$renderer.push(`<!----></section>`);
				} else if (section.id === "scientificSignificance") {
					$$renderer.push('<!--[10-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.scientificSignificance") || "Scientific Significance",
						items: story.scientific_significance,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'scientific_significance'
					});
				} else if (section.id === "travelAdvisory") {
					$$renderer.push('<!--[11-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.travelAdvisory") || "Travel Advisory",
						items: story.travel_advisory,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'travel_advisory'
					});
				} else if (section.id === "performanceStatistics") {
					$$renderer.push('<!--[12-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.performanceStatistics") || "Performance Statistics",
						items: story.performance_statistics,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'performance_statistics'
					});
				} else if (section.id === "leagueStandings") {
					$$renderer.push('<!--[13-->');

					StoryTextSection($$renderer, {
						title: storyLocalizer("section.leagueStandings") || "League Standings",
						content: story.league_standings,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'league_standings'
					});
				} else if (section.id === "designPrinciples") {
					$$renderer.push('<!--[14-->');

					StoryTextSection($$renderer, {
						title: storyLocalizer("section.designPrinciples") || "Design Principles",
						content: story.design_principles,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'design_principles'
					});
				} else if (section.id === "userExperienceImpact") {
					$$renderer.push('<!--[15-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.userExperienceImpact") || "User Experience Impact",
						items: story.user_experience_impact,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'user_experience_impact'
					});
				} else if (section.id === "gameplayMechanics") {
					$$renderer.push('<!--[16-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.gameplayMechanics") || "Gameplay Mechanics",
						items: story.gameplay_mechanics,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'gameplay_mechanics'
					});
				} else if (section.id === "industryImpact") {
					$$renderer.push('<!--[17-->');

					StoryListSection($$renderer, {
						title: storyLocalizer("section.industryImpact") || "Industry Impact",
						items: story.gaming_industry_impact,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'gaming_industry_impact'
					});
				} else if (section.id === "technicalSpecifications") {
					$$renderer.push('<!--[18-->');

					StoryTextSection($$renderer, {
						title: storyLocalizer("section.technicalSpecifications") || "Technical Specifications",
						content: story.technical_specifications,
						articles: story.articles,
						citationMapping: citationMapping(),
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'technical_specifications'
					});
				} else if (section.id === "timeline") {
					$$renderer.push('<!--[19-->');

					StoryTimeline($$renderer, {
						timeline: story.timeline,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "internationalReactions") {
					$$renderer.push('<!--[20-->');

					StoryInternationalReactions($$renderer, {
						reactions: story.international_reactions,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "suggestedQnA") {
					$$renderer.push('<!--[21-->');

					StorySuggestedQnA($$renderer, {
						qna: story.suggested_qna,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "actionItems") {
					$$renderer.push('<!--[22-->');

					StoryActionItems($$renderer, {
						actionItems: story.user_action_items,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "didYouKnow") {
					$$renderer.push('<!--[23-->');

					StoryDidYouKnow($$renderer, {
						content: story.did_you_know,
						articles: story.articles,
						citationMapping: citationMapping(),
						storyLocalizer,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick
					});
				} else if (section.id === "sources") {
					$$renderer.push('<!--[24-->');

					StorySources($$renderer, {
						domains: story.domains,
						articles: story.articles,
						storyLocalizer,
						get showSourceOverlay() {
							return showSourceOverlay;
						},

						set showSourceOverlay($$value) {
							showSourceOverlay = $$value;
							$$settled = false;
						},

						get currentSource() {
							return currentSource;
						},

						set currentSource($$value) {
							currentSource = $$value;
							$$settled = false;
						},

						get sourceArticles() {
							return sourceArticles;
						},

						set sourceArticles($$value) {
							sourceArticles = $$value;
							$$settled = false;
						},

						get currentMediaInfo() {
							return currentMediaInfo;
						},

						set currentMediaInfo($$value) {
							currentMediaInfo = $$value;
							$$settled = false;
						},

						get isLoadingMediaInfo() {
							return isLoadingMediaInfo;
						},

						set isLoadingMediaInfo($$value) {
							isLoadingMediaInfo = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			showSourceOverlay,
			currentSource,
			sourceArticles,
			currentMediaInfo,
			isLoadingMediaInfo
		});
	});
}