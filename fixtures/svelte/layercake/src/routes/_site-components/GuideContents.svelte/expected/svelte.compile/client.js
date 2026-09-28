import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<li class="svelte-p8o6km"><a> </a> <!></li>`);
var root_2 = $.from_html(`<ul class="guide-toc svelte-p8o6km"></ul>`);

export default function GuideContents($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {import('../../_modules/getSections.js').GuideSection} GuideSection
	 */
	/**
	 * @typedef {Object} Props
	 * @property {boolean} [open]
	 * @property {string} [activeGuideSection]
	 * @property {GuideSection[]} [sections]
	 */
	/** @type {Props} */
	let open = $.prop($$props, 'open', 15, false),
		sections = $.prop($$props, 'sections', 19, () => []);

	// svelte-ignore state_referenced_locally
	const guideSections = sections().map(/** @param {GuideSection} section */ (section) => {
		return {
			metadata: section.metadata,
			subsections: section.subsections,
			slug: section.slug
		};
	});

	function close() {
		open(false);
	}

	var ul = root_2();

	$.each(ul, 21, () => guideSections, $.index, ($$anchor, section) => {
		var li = root_1();
		var a = $.child(li);
		var text = $.only_child(a, true);
		var node = $.sibling(a, 2);

		$.each(node, 17, () => $.get(section).subsections, $.index, ($$anchor, subsection) => {
			var a_1 = root();
			var text_1 = $.only_child(a_1, true);

			$.template_effect(() => {
				$.set_class(a_1, 1, `subsection ${$.get(subsection).slug === $$props.activeGuideSection ? 'active' : ''}`, 'svelte-p8o6km');
				$.set_attribute(a_1, 'href', `/guide#${$.get(subsection).slug ?? ''}`);
				$.set_text(text_1, $.get(subsection).title);
			});

			$.delegated('click', a_1, close);
			$.append($$anchor, a_1);
		});

		$.reset(li);

		$.template_effect(() => {
			$.set_class(a, 1, `section ${$.get(section).slug === $$props.activeGuideSection ? 'active' : ''}`, 'svelte-p8o6km');
			$.set_attribute(a, 'href', `/guide#${$.get(section).slug ?? ''}`);
			$.set_text(text, $.get(section).metadata.title);
		});

		$.delegated('click', a, close);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}

$.delegate(['click']);