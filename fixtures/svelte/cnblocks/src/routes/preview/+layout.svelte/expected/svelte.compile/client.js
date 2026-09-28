import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import SEOComponent from "$lib/seo/SEO.svelte";

var root = $.from_html(`<div><div><div><!></div></div></div>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const numberWords = new Map([
		["one", "One"],
		["two", "Two"],
		["three", "Three"],
		["four", "Four"],
		["five", "Five"],
		["six", "Six"],
		["seven", "Seven"],
		["eight", "Eight"],
		["nine", "Nine"],
		["ten", "Ten"],
		["eleven", "Eleven"],
		["twelve", "Twelve"],
		["thirteen", "Thirteen"],
		["fourteen", "Fourteen"]
	]);

	const routeAliases = {
		cta: "Call To Action",
		faq: "FAQ",
		faqs: "FAQs",
		logocloud: "Logo Cloud",
		"logo-cloud": "Logo Cloud",
		features: "Features",
		testimonial: "Testimonial"
	};

	function formatToken(token) {
		if (routeAliases[token]) {
			return routeAliases[token];
		}

		if (numberWords.has(token)) {
			return numberWords.get(token);
		}

		return token.split("-").map((part) => routeAliases[part] ?? numberWords.get(part) ?? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
	}

	function getPreviewMeta(pathname) {
		const segments = pathname.split("/").filter(Boolean);
		const previewSegments = segments[0] === "preview" ? segments.slice(1) : segments;
		const themeSegment = previewSegments[0] === "veil" || previewSegments[0] === "mist" ? previewSegments[0] : null;
		const contentSegments = themeSegment ? previewSegments.slice(1) : previewSegments;
		const [category = "component", ...variantParts] = contentSegments;
		const themeLabel = themeSegment ? `${formatToken(themeSegment)} ` : "";
		const categoryLabel = formatToken(category);
		const variantLabel = variantParts.map(formatToken).join(" ").trim();
		const title = `${themeLabel}${categoryLabel}${variantLabel ? ` ${variantLabel}` : ""} Preview`;
		const description = `Preview page for the ${themeLabel.toLowerCase()}${categoryLabel.toLowerCase()}${variantLabel ? ` ${variantLabel.toLowerCase()}` : ""} block in Svelte Marketing Blocks.`;

		const keywords = [
			"preview",
			"svelte marketing blocks",
			themeSegment,
			category,
			...variantParts
		].filter((value) => Boolean(value));

		return { title, description, keywords };
	}

	function resolvePreviewTheme(pathname) {
		const segments = pathname.split("/").filter(Boolean);
		const themeSegment = segments[0] === "preview" ? segments[1] : segments[0];

		return themeSegment === "veil" || themeSegment === "mist" ? themeSegment : null;
	}

	function getPreviewCategory(pathname) {
		const segments = pathname.split("/").filter(Boolean);
		const previewSegments = segments[0] === "preview" ? segments.slice(1) : segments;
		const themeSegment = previewSegments[0] === "veil" || previewSegments[0] === "mist" ? previewSegments[0] : null;
		const contentSegments = themeSegment ? previewSegments.slice(1) : previewSegments;

		return contentSegments[0] ?? null;
	}

	const seo = $.derived(() => getPreviewMeta(page.url.pathname));
	const previewTheme = $.derived(() => resolvePreviewTheme(page.url.pathname));
	const previewCategory = $.derived(() => getPreviewCategory(page.url.pathname));
	var fragment = root_2();
	var node = $.first_child(fragment);

	SEOComponent(node, {
		get title() {
			return $.get(seo).title;
		},

		get description() {
			return $.get(seo).description;
		},

		get keywords() {
			return $.get(seo).keywords;
		},
		noindex: true
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_2 = $.child(div_2);

			$.snippet(node_2, () => $$props.children);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(div, 'data-theme', $.get(previewTheme));

				$.set_class(div_1, 1, $.clsx([
					"theme-container",
					$.get(previewCategory) === "header" && "min-h-[140vh] bg-background"
				]));

				$.set_class(div_2, 1, $.clsx($.get(previewCategory) === "header" ? "pb-24" : undefined));
			});

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_1();
			var node_3 = $.child(div_3);

			$.snippet(node_3, () => $$props.children);
			$.reset(div_3);
			$.template_effect(() => $.set_class(div_3, 1, $.clsx($.get(previewCategory) === "header" ? "min-h-[140vh] bg-background pb-24" : undefined)));
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(previewTheme)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}