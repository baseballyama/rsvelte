import * as $ from 'svelte/internal/server';
import { site } from '$lib/constants/site';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sections = [
			{
				title: 'Our Commitment',
				content: 'Networking Toolbox is designed to be accessible to everyone. We meet WCAG 2.1 Level AA standards and continuously work to improve accessibility for all users.'
			},

			{
				title: 'Accessibility Features',
				list: [
					'Fully keyboard navigable - use Tab, Enter, and arrow keys to navigate without a mouse',
					'Screen reader compatible - tested with NVDA, JAWS, and VoiceOver',
					'Customizable display options in Settings:',
					'  • High contrast themes',
					'  • Adjustable text size',
					'  • Dyslexic-friendly font option',
					'  • Enhanced focus indicators',
					'  • Reduced motion mode',
					'Semantic HTML and ARIA labels throughout',
					'Clear color contrast ratios',
					'Alternative text for all images and icons'
				]
			},

			{
				title: 'Feedback & Improvements',
				content: 'We welcome feedback on accessibility issues. If you encounter any barriers while using Networking Toolbox, please open an issue on GitHub or contact us directly. Pull requests for accessibility enhancements are always appreciated.',
				link: {
					text: 'Report an accessibility issue',
					url: site.repo + '/issues'
				}
			},

			{
				title: 'Third-Party Content',
				content: 'While we strive to ensure our platform is accessible, some diagnostic tools may interact with third-party services beyond our control. We do our best to present this information accessibly.'
			}
		];

		$.head('rjx6e7', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Accessibility Policy | Networking Toolbox</title>`);
			});

			$$renderer.push(`<meta name="description" content="Accessibility policy for Networking Toolbox - WCAG AA compliant with keyboard navigation and screen reader support"/> <meta property="og:title"${$.attr('content', `Accessibility Policy | ${$.stringify(site.title)}`)}/> <meta property="og:description" content="Learn about accessibility features and standards in Networking Toolbox"/> <meta property="og:url"${$.attr('content', `${$.stringify(site.url)}/about/legal/accessibility`)}/>`);
		});

		$$renderer.push(`<div class="hero"><h2>Accessibility Policy</h2> <p class="lead">Making networking tools accessible to everyone.</p></div> <!--[-->`);

		const each_array = $.ensure_array_like(sections);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let section = each_array[$$index_1];

			$$renderer.push(`<section><h3>${$.escape(section.title)}</h3> <p>${$.escape(section.content)}</p> `);

			if (section.list) {
				$$renderer.push(`<!--[0--><ul><!--[-->`);

				const each_array_1 = $.ensure_array_like(section.list);

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let item = each_array_1[index];

					$$renderer.push(`<li>${$.escape(item)}</li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (section.link) {
				$$renderer.push(`<!--[0--><p><a${$.attr('href', section.link.url)} rel="noopener noreferrer" target="_blank">${$.escape(section.link.text)}</a></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}