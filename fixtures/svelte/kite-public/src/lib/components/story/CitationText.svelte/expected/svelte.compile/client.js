import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import CitationTooltip from './CitationTooltip.svelte';

var root = $.from_html(`<span class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help svelte-hchnco"> </span>`);
var root_1 = $.from_html(`<button type="button" class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"><span class="sr-only"> </span><span aria-hidden="true"> </span></button>`);
var root_2 = $.from_html(`<button type="button" class="citation-number citation-group-badge text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"><span class="sr-only"> </span><span aria-hidden="true"> </span></button>`);
var root_3 = $.from_html(`<p dir="auto"></p>`);
var root_4 = $.from_html(`<div class="favicon-wrapper relative size-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:z-10 transition-all hover:scale-110 svelte-hchnco"><!></div>`);
var root_5 = $.from_html(`<div class="ms-3 text-xs text-gray-500 dark:text-gray-400"> </div>`);
var root_6 = $.from_html(`<div class="citation-sources flex items-center cursor-pointer svelte-hchnco" role="button" tabindex="0"><span class="text-xs text-gray-500 dark:text-gray-400 me-2"> </span> <div class="flex items-center -space-x-3"><!> <!></div></div>`);
var root_7 = $.from_html(`<div class="citation-item svelte-hchnco" dir="auto"> <!></div>`);
var root_8 = $.from_html(`<div class="citation-list mt-2 text-sm text-gray-600 dark:text-gray-400 svelte-hchnco"></div>`);
var root_9 = $.from_html(`<button class="mt-2 text-xs text-gray-600 dark:text-gray-400 hover:underline"> </button> <!>`, 1);
var root_10 = $.from_html(`<div class="citation-wrapper svelte-hchnco"><div><!></div> <!> <!></div> <!>`, 1);

export default function CitationText($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Whether to render inline (for list items) or as block (for paragraphs)
	// Articles for citation tooltip
	// Global citation mapping
	// External tooltip reference for shared tooltips
	// Story-specific localization function
	let showFavicons = $.prop($$props, 'showFavicons', 3, false // Changed default to false (most common usage)
		),
		showNumbers = $.prop($$props, 'showNumbers', 3, false),
		inline = $.prop($$props, 'inline', 3, true // Changed default to true (most common usage)
		),
		articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s // Use regular localization if not provided
		);

	// Helper function to parse citations from a text string
	function parseCitationsFromText(textString) {
		const citationPattern = /\[(\d+|\*)\]/g;
		const segments = [];
		const citations = [];
		const citedArticleIndices = [];
		let lastIndex = 0;
		let match = citationPattern.exec(textString);

		while (match !== null) {
			// Add text before citation
			if (match.index > lastIndex) {
				segments.push({
					type: 'text',
					content: textString.slice(lastIndex, match.index)
				});
			}

			const citationText = match[1];
			const fullText = match[0];

			// Handle common knowledge citations
			if (citationText === '*') {
				const citation = {
					id: `citation-common`,
					domain: 'common',
					articleId: 'common',
					fullText,
					number: -1 // Special marker for common knowledge
				};

				segments.push({ type: 'citation', content: fullText, citation });
				citations.push(citation);
			} else {
				// Handle numbered citations
				const citationNumber = parseInt(citationText, 10);

				// Get article from citation mapping or fallback to direct index
				let article;

				if ($$props.citationMapping) {
					// Use the citation mapping to get the article
					article = $$props.citationMapping.numberToArticle.get(citationNumber);
				} else {
					// Fallback to direct array index
					article = articles()[citationNumber - 1];
				}

				if (article) {
					const citation = {
						id: `citation-${citationNumber}`,
						domain: article.domain,
						articleId: citationNumber.toString(),
						fullText,
						number: citationNumber
					};

					segments.push({ type: 'citation', content: fullText, citation });
					citations.push(citation);

					// Find the article index in the articles array
					const articleIndex = articles().indexOf(article);

					if (articleIndex >= 0) {
						citedArticleIndices.push(articleIndex);
					}
				} else {
					// No matching article, treat as text
					segments.push({ type: 'text', content: fullText });
				}
			}

			lastIndex = match.index + match[0].length;
			match = citationPattern.exec(textString);
		}

		// Add remaining text
		if (lastIndex < textString.length) {
			segments.push({ type: 'text', content: textString.slice(lastIndex) });
		}

		return { segments, citations, citedArticleIndices };
	}

	// Parse text into paragraphs, then parse citations within each paragraph
	const parsedData = $.derived(() => {
		// Ensure text is a string
		let textString = typeof $$props.text === 'string' ? $$props.text : String($$props.text || '');

		// Handle both actual newlines and escaped \n sequences (from JSON)
		textString = textString.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');

		// Split into paragraphs (by double newline)
		const paragraphTexts = textString.split(/\n\n+/).filter((p) => p.trim());

		// If only one paragraph or inline mode, parse as single block
		if (paragraphTexts.length <= 1 || inline()) {
			const result = parseCitationsFromText(textString.replace(/\n\n+/g, ' '));

			return {
				paragraphs: [{ segments: result.segments }],
				formattedSegments: result.segments, // Keep for backwards compatibility
				citations: result.citations,
				citedArticleIndices: result.citedArticleIndices
			};
		}

		// Parse each paragraph separately
		const allCitations = [];

		const allCitedIndices = [];

		const paragraphs = paragraphTexts.map((paragraphText) => {
			const result = parseCitationsFromText(paragraphText);

			allCitations.push(...result.citations);
			allCitedIndices.push(...result.citedArticleIndices);

			return { segments: result.segments };
		});

		// Flatten segments for backwards compatibility
		const allSegments = paragraphs.flatMap((p) => p.segments);

		return {
			paragraphs,
			formattedSegments: allSegments,
			citations: allCitations,
			citedArticleIndices: allCitedIndices
		};
	});

	// Get unique domains for favicon display
	const uniqueDomains = $.derived(() => {
		const domains = new Set();

		$.get(parsedData).citations.forEach((citation) => {
			if (citation.domain && citation.domain !== 'common') {
				domains.add(citation.domain);
			}
		});

		return Array.from(domains);
	});

	// Threshold for collapsing citations (more than this will be collapsed)
	const CITATION_COLLAPSE_THRESHOLD = 3;

	// Group consecutive citations for collapsed display
	function groupConsecutiveCitations(segments) {
		const result = [];
		let currentCitationRun = [];

		const flushCitationRun = () => {
			if (currentCitationRun.length === 0) return;

			if (currentCitationRun.length <= CITATION_COLLAPSE_THRESHOLD) {
				// Keep individual citations
				result.push(...currentCitationRun);
			} else {
				// Collapse into a group
				const citations = currentCitationRun.map((seg) => seg.citation).filter((c) => c !== undefined);

				const numbers = citations.map((c) => c.number).filter((n) => n !== undefined && n !== -1);

				// Format the display text using range notation where possible
				const displayText = formatCitationRange(numbers);

				result.push({
					type: 'citation-group',
					group: { type: 'group', citations, numbers, displayText }
				});
			}

			currentCitationRun = [];
		};

		for (const segment of segments) {
			if (segment.type === 'citation') {
				currentCitationRun.push(segment);
			} else {
				// Check if this is just whitespace between citations
				if (segment.type === 'text' && (/^\s*$/).test(segment.content) && currentCitationRun.length > 0) {
					// Keep accumulating - whitespace between citations shouldn't break the run
					currentCitationRun.push(segment);
				} else {
					flushCitationRun();
					result.push(segment);
				}
			}
		}

		flushCitationRun();

		return result;
	}

	// Format citation numbers as a compact range string
	// e.g., [1,2,3,4,5] -> "[1-5]", [1,3,4,5] -> "[1,3-5]", [1,3,5,7] -> "[1,3,5,7]"
	function formatCitationRange(numbers) {
		if (numbers.length === 0) return '';
		if (numbers.length === 1) return `[${numbers[0]}]`;

		// Sort numbers
		const sorted = [...numbers].sort((a, b) => a - b);

		// Find consecutive ranges
		const ranges = [];

		let rangeStart = sorted[0];
		let rangeEnd = sorted[0];

		for (let i = 1; i < sorted.length; i++) {
			if (sorted[i] === rangeEnd + 1) {
				// Extend current range
				rangeEnd = sorted[i];
			} else {
				// Push current range and start new one
				if (rangeStart === rangeEnd) {
					ranges.push(rangeStart);
				} else {
					ranges.push([rangeStart, rangeEnd]);
				}

				rangeStart = sorted[i];
				rangeEnd = sorted[i];
			}
		}

		// Push final range
		if (rangeStart === rangeEnd) {
			ranges.push(rangeStart);
		} else {
			ranges.push([rangeStart, rangeEnd]);
		}

		// Format as string
		const parts = ranges.map((r) => {
			if (typeof r === 'number') {
				return `${r}`;
			} else {
				const [start, end] = r;

				// Use hyphen for ranges of 3+, comma for just 2
				if (end - start >= 2) {
					return `${start}-${end}`;
				} else {
					return `${start},${end}`;
				}
			}
		});

		return `[${parts.join(',')}]`;
	}

	// Group segments for display
	const groupedSegments = $.derived(() => {
		return {
			paragraphs: $.get(parsedData).paragraphs.map((p) => ({ segments: groupConsecutiveCitations(p.segments) })),
			formattedSegments: groupConsecutiveCitations($.get(parsedData).formattedSegments)
		};
	});

	// State for showing citation sources
	let showSources = $.state(false);

	// Check if any citations are common knowledge
	const hasCommonKnowledge = $.derived(() => {
		return $.get(parsedData).citations.some((citation) => citation.domain === 'common');
	});

	// Citation tooltip reference
	let citationTooltip = $.state(void 0);

	// Use external tooltip if provided, otherwise use internal one
	const tooltipReference = $.derived(() => $$props.citationTooltip || $.get(citationTooltip));

	// Get only the articles that are cited in this text with their citation numbers
	const citedArticlesWithNumbers = $.derived(() => {
		return $.get(parsedData).citations.map((citation) => ({
			article: citation.domain === 'common'
				? null
				: $$props.citationMapping
					? $$props.citationMapping.numberToArticle.get(citation.number)
					: articles()[citation.number - 1],
			number: citation.number,
			isCommon: citation.domain === 'common'
		}));
	});

	// Just the articles for backwards compatibility
	const citedArticles = $.derived(() => {
		return $.get(citedArticlesWithNumbers).filter((item) => !!item.article).map((item) => item.article);
	});

	var fragment = root_10();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $.get(groupedSegments).formattedSegments, $.index, ($$anchor, segment) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(segment).content));
						$.append($$anchor, text_1);
					};

					var consequent_2 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						{
							var consequent_1 = ($$anchor) => {
								var span = root();
								var text_2 = $.only_child(span, true);

								$.template_effect(() => {
									$.set_attribute(span, 'title', `Source: ${$.get(segment).citation?.domain ?? ''}`);
									$.set_text(text_2, $.get(segment).content);
								});

								$.append($$anchor, span);
							};

							var alternate = ($$anchor) => {
								var button = root_1();
								var span_1 = $.child(button);
								var text_3 = $.only_child(span_1, true);
								var span_2 = $.sibling(span_1);
								var text_4 = $.only_child(span_2, true);

								$.reset(button);

								$.template_effect(() => {
									$.set_attribute(button, 'title', $.get(segment).citation?.domain === "common"
										? "Common knowledge"
										: `Source ${$.get(segment).citation?.number}: ${$.get(segment).citation?.domain}`);

									$.set_text(text_3, $.get(segment).citation?.domain === "common"
										? "Common knowledge citation"
										: `Citation ${$.get(segment).citation?.number} from ${$.get(segment).citation?.domain}`);

									$.set_text(text_4, $.get(segment).content);
								});

								$.delegated('mouseover', button, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));
								$.event('mouseleave', button, (e) => $.get(tooltipReference)?.handleCitationLeave(e));
								$.delegated('click', button, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));
								$.delegated('keydown', button, (e) => (e.key === "Enter" || e.key === " ") && $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));

								$.delegated(
									'touchstart',
									button,
									(e) => {
										e.stopPropagation();

										// Record touch time to ignore subsequent mouseover
										if ($.get(tooltipReference) && "recordTouch" in $.get(tooltipReference)) {
											$.get(tooltipReference).recordTouch();
										}
									},
									void 0,
									true
								);

								$.append($$anchor, button);
							};

							$.if(node_3, ($$render) => {
								if (showNumbers()) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_4);
					};

					var consequent_3 = ($$anchor) => {
						var button_1 = root_2();
						var span_3 = $.child(button_1);
						var text_5 = $.only_child(span_3);
						var span_4 = $.sibling(span_3);
						var text_6 = $.only_child(span_4, true);

						$.reset(button_1);

						$.template_effect(
							($0) => {
								$.set_attribute(button_1, 'title', $0);
								$.set_text(text_5, `${$.get(segment).group.numbers.length ?? ''} citations from multiple sources`);
								$.set_text(text_6, $.get(segment).group.displayText);
							},
							[
								() => `${$.get(segment).group.numbers.length} sources: ${$.get(segment).group.numbers.join(', ')}`
							]
						);

						$.delegated('mouseover', button_1, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));
						$.event('mouseleave', button_1, (e) => $.get(tooltipReference)?.handleCitationLeave(e));
						$.delegated('click', button_1, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));
						$.delegated('keydown', button_1, (e) => (e.key === "Enter" || e.key === " ") && $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));

						$.delegated(
							'touchstart',
							button_1,
							(e) => {
								e.stopPropagation();

								if ($.get(tooltipReference) && "recordTouch" in $.get(tooltipReference)) {
									$.get(tooltipReference).recordTouch();
								}
							},
							void 0,
							true
						);

						$.append($$anchor, button_1);
					};

					$.if(node_2, ($$render) => {
						if ($.get(segment).type === "text") $$render(consequent); else if ($.get(segment).type === "citation") $$render(consequent_2, 1); else if ($.get(segment).type === "citation-group") $$render(consequent_3, 2);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_2 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			$.each(node_4, 17, () => $.get(groupedSegments).paragraphs, $.index, ($$anchor, paragraph, paragraphIndex) => {
				var p_1 = root_3();

				$.each(p_1, 21, () => $.get(paragraph).segments, $.index, ($$anchor, segment) => {
					var fragment_6 = $.comment();
					var node_5 = $.first_child(fragment_6);

					{
						var consequent_5 = ($$anchor) => {
							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(segment).content));
							$.append($$anchor, text_7);
						};

						var consequent_7 = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_6 = $.first_child(fragment_8);

							{
								var consequent_6 = ($$anchor) => {
									var span_5 = root();
									var text_8 = $.only_child(span_5, true);

									$.template_effect(() => {
										$.set_attribute(span_5, 'title', `Source: ${$.get(segment).citation?.domain ?? ''}`);
										$.set_text(text_8, $.get(segment).content);
									});

									$.append($$anchor, span_5);
								};

								var alternate_1 = ($$anchor) => {
									var button_2 = root_1();
									var span_6 = $.child(button_2);
									var text_9 = $.only_child(span_6, true);
									var span_7 = $.sibling(span_6);
									var text_10 = $.only_child(span_7, true);

									$.reset(button_2);

									$.template_effect(() => {
										$.set_attribute(button_2, 'title', $.get(segment).citation?.domain === "common"
											? "Common knowledge"
											: `Source ${$.get(segment).citation?.number}: ${$.get(segment).citation?.domain}`);

										$.set_text(text_9, $.get(segment).citation?.domain === "common"
											? "Common knowledge citation"
											: `Citation ${$.get(segment).citation?.number} from ${$.get(segment).citation?.domain}`);

										$.set_text(text_10, $.get(segment).content);
									});

									$.delegated('mouseover', button_2, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));
									$.event('mouseleave', button_2, (e) => $.get(tooltipReference)?.handleCitationLeave(e));
									$.delegated('click', button_2, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));
									$.delegated('keydown', button_2, (e) => (e.key === "Enter" || e.key === " ") && $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).citation?.number));

									$.delegated(
										'touchstart',
										button_2,
										(e) => {
											e.stopPropagation();

											// Record touch time to ignore subsequent mouseover
											if ($.get(tooltipReference) && "recordTouch" in $.get(tooltipReference)) {
												$.get(tooltipReference).recordTouch();
											}
										},
										void 0,
										true
									);

									$.append($$anchor, button_2);
								};

								$.if(node_6, ($$render) => {
									if (showNumbers()) $$render(consequent_6); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_8);
						};

						var consequent_8 = ($$anchor) => {
							var button_3 = root_2();
							var span_8 = $.child(button_3);
							var text_11 = $.only_child(span_8);
							var span_9 = $.sibling(span_8);
							var text_12 = $.only_child(span_9, true);

							$.reset(button_3);

							$.template_effect(
								($0) => {
									$.set_attribute(button_3, 'title', $0);
									$.set_text(text_11, `${$.get(segment).group.numbers.length ?? ''} citations from multiple sources`);
									$.set_text(text_12, $.get(segment).group.displayText);
								},
								[
									() => `${$.get(segment).group.numbers.length} sources: ${$.get(segment).group.numbers.join(', ')}`
								]
							);

							$.delegated('mouseover', button_3, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));
							$.event('mouseleave', button_3, (e) => $.get(tooltipReference)?.handleCitationLeave(e));
							$.delegated('click', button_3, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));
							$.delegated('keydown', button_3, (e) => (e.key === "Enter" || e.key === " ") && $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains), $.get(segment).group.numbers));

							$.delegated(
								'touchstart',
								button_3,
								(e) => {
									e.stopPropagation();

									if ($.get(tooltipReference) && "recordTouch" in $.get(tooltipReference)) {
										$.get(tooltipReference).recordTouch();
									}
								},
								void 0,
								true
							);

							$.append($$anchor, button_3);
						};

						$.if(node_5, ($$render) => {
							if ($.get(segment).type === "text") $$render(consequent_5); else if ($.get(segment).type === "citation") $$render(consequent_7, 1); else if ($.get(segment).type === "citation-group") $$render(consequent_8, 2);
						});
					}

					$.append($$anchor, fragment_6);
				});

				$.reset(p_1);

				$.template_effect(() => {
					$.set_class(p_1, 1, `text-base ${paragraphIndex < $.get(groupedSegments).paragraphs.length - 1 ? 'mb-4' : 'mb-2'}`);
					p_1.dir = p_1.dir;
				});

				$.append($$anchor, p_1);
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if (inline()) $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_1);

	var node_7 = $.sibling(div_1, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_2 = root_6();
			var span_10 = $.child(div_2);
			var text_13 = $.only_child(span_10, true);
			var div_3 = $.sibling(span_10, 2);
			var node_8 = $.child(div_3);

			$.each(node_8, 17, () => $.get(uniqueDomains).slice(0, 5), $.index, ($$anchor, domain, index) => {
				var div_4 = root_4();

				$.set_style(div_4, `z-index: ${5 - index}`);

				var node_9 = $.child(div_4);

				FaviconImage(node_9, {
					get domain() {
						return $.get(domain);
					},

					get alt() {
						return `${$.get(domain) ?? ''} favicon`;
					},
					class: 'size-5 rounded-sm',
					loading: 'lazy'
				});

				$.reset(div_4);
				$.template_effect(() => $.set_attribute(div_4, 'title', $.get(domain)));
				$.append($$anchor, div_4);
			});

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_5 = root_5();
					var text_14 = $.only_child(div_5);

					$.template_effect(() => $.set_text(text_14, `+${$.get(uniqueDomains).length - 5} more`));
					$.append($$anchor, div_5);
				};

				$.if(node_10, ($$render) => {
					if ($.get(uniqueDomains).length > 5) $$render(consequent_9);
				});
			}

			$.reset(div_3);
			$.reset(div_2);

			$.template_effect(
				($0, $1) => {
					$.set_attribute(div_2, 'aria-label', `View sources: ${$0 ?? ''}`);
					$.set_text(text_13, $1);
				},
				[
					() => $.get(uniqueDomains).join(', '),
					() => storyLocalizer()($.get(uniqueDomains).length === 1 ? "citation.source" : "citation.sources")
				]
			);

			$.delegated('mouseover', div_2, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains)));
			$.event('mouseleave', div_2, (e) => $.get(tooltipReference)?.handleCitationLeave(e));
			$.event('focus', div_2, () => {});
			$.event('blur', div_2, () => {});
			$.delegated('click', div_2, (e) => $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains)));
			$.delegated('keydown', div_2, (e) => (e.key === "Enter" || e.key === " ") && $.get(tooltipReference)?.handleCitationInteraction(e, $.get(uniqueDomains)));

			$.delegated(
				'touchstart',
				div_2,
				(e) => {
					e.stopPropagation();

					// Record touch time to ignore subsequent mouseover
					if ($.get(tooltipReference) && "recordTouch" in $.get(tooltipReference)) {
						$.get(tooltipReference).recordTouch();
					}
				},
				void 0,
				true
			);

			$.append($$anchor, div_2);
		};

		$.if(node_7, ($$render) => {
			if (showFavicons() && $.get(uniqueDomains).length > 0) $$render(consequent_10);
		});
	}

	var node_11 = $.sibling(node_7, 2);

	{
		var consequent_13 = ($$anchor) => {
			var fragment_9 = root_9();
			var button_4 = $.first_child(fragment_9);
			var text_15 = $.only_child(button_4);
			var node_12 = $.sibling(button_4, 2);

			{
				var consequent_12 = ($$anchor) => {
					var div_6 = root_8();

					$.each(div_6, 21, () => $.get(parsedData).citations, $.index, ($$anchor, citation, index) => {
						var div_7 = root_7();
						var text_16 = $.child(div_7);
						var node_13 = $.sibling(text_16);

						{
							var consequent_11 = ($$anchor) => {
								FaviconImage($$anchor, {
									get domain() {
										return $.get(citation).domain;
									},

									get alt() {
										return `${$.get(citation).domain ?? ''} favicon`;
									},
									class: 'inline-block size-3 ms-1 rounded-sm',
									loading: 'lazy'
								});
							};

							$.if(node_13, ($$render) => {
								if ($.get(citation).domain !== "common") $$render(consequent_11);
							});
						}

						$.reset(div_7);

						$.template_effect(() => {
							$.set_text(text_16, `[${index + 1}] ${$.get(citation).domain ?? ''} `);
							div_7.dir = div_7.dir;
						});

						$.append($$anchor, div_7);
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				$.if(node_12, ($$render) => {
					if ($.get(showSources)) $$render(consequent_12);
				});
			}

			$.template_effect(() => $.set_text(text_15, `${$.get(showSources) ? "Hide" : "Show"} sources`));
			$.delegated('click', button_4, () => $.set(showSources, !$.get(showSources)));
			$.append($$anchor, fragment_9);
		};

		$.if(node_11, ($$render) => {
			if (showNumbers() && $.get(parsedData).citations.length > 0 && !inline()) $$render(consequent_13);
		});
	}

	$.reset(div);

	var node_14 = $.sibling(div, 2);

	{
		var consequent_14 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(citedArticlesWithNumbers).map((item) => item.number));

				$.bind_this(
					CitationTooltip($$anchor, {
						get articles() {
							return $.get(citedArticles);
						},

						get citationNumbers() {
							return $.get($0);
						},

						get hasCommonKnowledge() {
							return $.get(hasCommonKnowledge);
						},

						get citedItems() {
							return $.get(citedArticlesWithNumbers);
						},

						get storyLocalizer() {
							return storyLocalizer();
						}
					}),
					($$value) => $.set(citationTooltip, $$value, true),
					() => $.get(citationTooltip)
				);
			}
		};

		$.if(node_14, ($$render) => {
			if (!$$props.citationTooltip) $$render(consequent_14);
		});
	}

	$.template_effect(() => $.set_class(div_1, 1, `citation-content ${inline() ? 'inline' : 'block'} ${inline() ? 'text-base' : ''}`, 'svelte-hchnco'));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mouseover', 'click', 'keydown', 'touchstart']);