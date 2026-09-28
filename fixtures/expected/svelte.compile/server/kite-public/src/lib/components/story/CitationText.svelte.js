import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import CitationTooltip from './CitationTooltip.svelte';

export default function CitationText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Whether to render inline (for list items) or as block (for paragraphs)
		// Articles for citation tooltip
		// Global citation mapping
		// External tooltip reference for shared tooltips
		// Story-specific localization function
		let {
			text,
			showFavicons = false, // Changed default to false (most common usage)
			showNumbers = false,
			inline = true, // Changed default to true (most common usage)
			articles = [],
			citationMapping,
			citationTooltip: externalTooltip,
			storyLocalizer = s // Use regular localization if not provided
		} = $$props;

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

					if (citationMapping) {
						// Use the citation mapping to get the article
						article = citationMapping.numberToArticle.get(citationNumber);
					} else {
						// Fallback to direct array index
						article = articles[citationNumber - 1];
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
						const articleIndex = articles.indexOf(article);

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
			let textString = typeof text === 'string' ? text : String(text || '');

			// Handle both actual newlines and escaped \n sequences (from JSON)
			textString = textString.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');

			// Split into paragraphs (by double newline)
			const paragraphTexts = textString.split(/\n\n+/).filter((p) => p.trim());

			// If only one paragraph or inline mode, parse as single block
			if (paragraphTexts.length <= 1 || inline) {
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

			parsedData().citations.forEach((citation) => {
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
				paragraphs: parsedData().paragraphs.map((p) => ({ segments: groupConsecutiveCitations(p.segments) })),
				formattedSegments: groupConsecutiveCitations(parsedData().formattedSegments)
			};
		});

		// State for showing citation sources
		let showSources = false;

		// Check if any citations are common knowledge
		const hasCommonKnowledge = $.derived(() => {
			return parsedData().citations.some((citation) => citation.domain === 'common');
		});

		// Citation tooltip reference
		let citationTooltip = void 0;

		// Use external tooltip if provided, otherwise use internal one
		const tooltipReference = $.derived(() => externalTooltip || citationTooltip);

		// Get only the articles that are cited in this text with their citation numbers
		const citedArticlesWithNumbers = $.derived(() => {
			return parsedData().citations.map((citation) => ({
				article: citation.domain === 'common'
					? null
					: citationMapping
						? citationMapping.numberToArticle.get(citation.number)
						: articles[citation.number - 1],
				number: citation.number,
				isCommon: citation.domain === 'common'
			}));
		});

		// Just the articles for backwards compatibility
		const citedArticles = $.derived(() => {
			return citedArticlesWithNumbers().filter((item) => !!item.article).map((item) => item.article);
		});

		$$renderer.push(`<div class="citation-wrapper svelte-hchnco"><div${$.attr_class(`citation-content ${inline ? 'inline' : 'block'} ${inline ? 'text-base' : ''}`, 'svelte-hchnco')}>`);

		if (inline) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(groupedSegments().formattedSegments);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let segment = each_array[$$index];

				if (segment.type === "text") {
					$$renderer.push(`<!--[0-->${$.escape(segment.content)}`);
				} else if (segment.type === "citation") {
					$$renderer.push('<!--[1-->');

					if (showNumbers) {
						$$renderer.push(`<!--[0--><span class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help svelte-hchnco"${$.attr('title', `Source: ${$.stringify(segment.citation?.domain)}`)}>${$.escape(segment.content)}</span>`);
					} else {
						$$renderer.push(`<!--[-1--><button type="button" class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"${$.attr('title', segment.citation?.domain === "common"
							? "Common knowledge"
							: `Source ${segment.citation?.number}: ${segment.citation?.domain}`)}><span class="sr-only">${$.escape(segment.citation?.domain === "common"
							? "Common knowledge citation"
							: `Citation ${segment.citation?.number} from ${segment.citation?.domain}`)}</span><span aria-hidden="true">${$.escape(segment.content)}</span></button>`);
					}

					$$renderer.push(`<!--]-->`);
				} else if (segment.type === "citation-group") {
					$$renderer.push(`<!--[2--><button type="button" class="citation-number citation-group-badge text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"${$.attr('title', `${segment.group.numbers.length} sources: ${segment.group.numbers.join(', ')}`)}><span class="sr-only">${$.escape(segment.group.numbers.length)} citations from multiple sources</span><span aria-hidden="true">${$.escape(segment.group.displayText)}</span></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_1 = $.ensure_array_like(groupedSegments().paragraphs);

			for (let paragraphIndex = 0,
				$$length = each_array_1.length; paragraphIndex < $$length; paragraphIndex++) {
				let paragraph = each_array_1[paragraphIndex];

				$$renderer.push(`<p${$.attr_class(`text-base ${paragraphIndex < groupedSegments().paragraphs.length - 1 ? 'mb-4' : 'mb-2'}`)} dir="auto"><!--[-->`);

				const each_array_2 = $.ensure_array_like(paragraph.segments);

				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let segment = each_array_2[$$index_1];

					if (segment.type === "text") {
						$$renderer.push(`<!--[0-->${$.escape(segment.content)}`);
					} else if (segment.type === "citation") {
						$$renderer.push('<!--[1-->');

						if (showNumbers) {
							$$renderer.push(`<!--[0--><span class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help svelte-hchnco"${$.attr('title', `Source: ${$.stringify(segment.citation?.domain)}`)}>${$.escape(segment.content)}</span>`);
						} else {
							$$renderer.push(`<!--[-1--><button type="button" class="citation-number text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"${$.attr('title', segment.citation?.domain === "common"
								? "Common knowledge"
								: `Source ${segment.citation?.number}: ${segment.citation?.domain}`)}><span class="sr-only">${$.escape(segment.citation?.domain === "common"
								? "Common knowledge citation"
								: `Citation ${segment.citation?.number} from ${segment.citation?.domain}`)}</span><span aria-hidden="true">${$.escape(segment.content)}</span></button>`);
						}

						$$renderer.push(`<!--]-->`);
					} else if (segment.type === "citation-group") {
						$$renderer.push(`<!--[2--><button type="button" class="citation-number citation-group-badge text-gray-600 dark:text-gray-400 text-xs align-super cursor-help font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-0.5 transition-colors border-0 bg-transparent p-0 svelte-hchnco"${$.attr('title', `${segment.group.numbers.length} sources: ${segment.group.numbers.join(', ')}`)}><span class="sr-only">${$.escape(segment.group.numbers.length)} citations from multiple sources</span><span aria-hidden="true">${$.escape(segment.group.displayText)}</span></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></p>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (showFavicons && uniqueDomains().length > 0) {
			$$renderer.push(`<!--[0--><div class="citation-sources flex items-center cursor-pointer svelte-hchnco" role="button" tabindex="0"${$.attr('aria-label', `View sources: ${$.stringify(uniqueDomains().join(', '))}`)}><span class="text-xs text-gray-500 dark:text-gray-400 me-2">${$.escape(storyLocalizer(uniqueDomains().length === 1 ? "citation.source" : "citation.sources"))}</span> <div class="flex items-center -space-x-3"><!--[-->`);

			const each_array_3 = $.ensure_array_like(uniqueDomains().slice(0, 5));

			for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
				let domain = each_array_3[index];

				$$renderer.push(`<div class="favicon-wrapper relative size-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:z-10 transition-all hover:scale-110 svelte-hchnco"${$.attr_style(`z-index: ${$.stringify(5 - index)}`)}${$.attr('title', domain)}>`);

				FaviconImage($$renderer, {
					domain,
					alt: `${$.stringify(domain)} favicon`,
					class: 'size-5 rounded-sm',
					loading: 'lazy'
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (uniqueDomains().length > 5) {
				$$renderer.push(`<!--[0--><div class="ms-3 text-xs text-gray-500 dark:text-gray-400">+${$.escape(uniqueDomains().length - 5)} more</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (showNumbers && parsedData().citations.length > 0 && !inline) {
			$$renderer.push(`<!--[0--><button class="mt-2 text-xs text-gray-600 dark:text-gray-400 hover:underline">${$.escape(showSources ? "Hide" : "Show")} sources</button> `);

			if (showSources) {
				$$renderer.push(`<!--[0--><div class="citation-list mt-2 text-sm text-gray-600 dark:text-gray-400 svelte-hchnco"><!--[-->`);

				const each_array_4 = $.ensure_array_like(parsedData().citations);

				for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
					let citation = each_array_4[index];

					$$renderer.push(`<div class="citation-item svelte-hchnco" dir="auto">[${$.escape(index + 1)}] ${$.escape(citation.domain)} `);

					if (citation.domain !== "common") {
						$$renderer.push('<!--[0-->');

						FaviconImage($$renderer, {
							domain: citation.domain,
							alt: `${$.stringify(citation.domain)} favicon`,
							class: 'inline-block size-3 ms-1 rounded-sm',
							loading: 'lazy'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!externalTooltip) {
			$$renderer.push('<!--[0-->');

			CitationTooltip($$renderer, {
				articles: citedArticles(),
				citationNumbers: citedArticlesWithNumbers().map((item) => item.number),
				hasCommonKnowledge: hasCommonKnowledge(),
				citedItems: citedArticlesWithNumbers(),
				storyLocalizer
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}