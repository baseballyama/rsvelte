import * as $ from 'svelte/internal/server';

export default function GuideContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let { open = false, activeGuideSection = void 0, sections = [] } = $$props;

		// svelte-ignore state_referenced_locally
		const guideSections = sections.map(/** @param {GuideSection} section */ (section) => {
			return {
				metadata: section.metadata,
				subsections: section.subsections,
				slug: section.slug
			};
		});

		function close() {
			open = false;
		}

		$$renderer.push(`<ul class="guide-toc svelte-p8o6km"><!--[-->`);

		const each_array = $.ensure_array_like(guideSections);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let section = each_array[$$index_1];

			$$renderer.push(`<li class="svelte-p8o6km"><a${$.attr_class(`section ${section.slug === activeGuideSection ? 'active' : ''}`, 'svelte-p8o6km')}${$.attr('href', `/guide#${$.stringify(section.slug)}`)}>${$.escape(section.metadata.title)}</a> <!--[-->`);

			const each_array_1 = $.ensure_array_like(section.subsections);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let subsection = each_array_1[$$index];

				$$renderer.push(`<a${$.attr_class(`subsection ${subsection.slug === activeGuideSection ? 'active' : ''}`, 'svelte-p8o6km')}${$.attr('href', `/guide#${$.stringify(subsection.slug)}`)}>${$.escape(subsection.title)}</a>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
		$.bind_props($$props, { open, activeGuideSection });
	});
}