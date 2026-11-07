import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';

var root = $.from_html(`<meta name="description" content="Accessibility policy for Networking Toolbox - WCAG AA compliant with keyboard navigation and screen reader support"/> <meta property="og:title"/> <meta property="og:description" content="Learn about accessibility features and standards in Networking Toolbox"/> <meta property="og:url"/>`, 1);
var root_1 = $.from_html(`<li> </li>`);
var root_2 = $.from_html(`<ul></ul>`);
var root_3 = $.from_html(`<p><a rel="noopener noreferrer" target="_blank"> </a></p>`);
var root_4 = $.from_html(`<section><h3> </h3> <p> </p> <!> <!></section>`);
var root_5 = $.from_html(`<div class="hero"><h2>Accessibility Policy</h2> <p class="lead">Making networking tools accessible to everyone.</p></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment_1 = root_5();

	$.head('rjx6e7', ($$anchor) => {
		var fragment = root();
		var meta = $.sibling($.first_child(fragment), 2);
		var meta_1 = $.sibling(meta, 4);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', `Accessibility Policy | ${site.title ?? ''}`);
			$.set_attribute(meta_1, 'content', `${site.url ?? ''}/about/legal/accessibility`);
		});

		$.effect(() => {
			$.document.title = 'Accessibility Policy | Networking Toolbox';
		});

		$.append($$anchor, fragment);
	});

	var node = $.sibling($.first_child(fragment_1), 2);

	$.each(node, 17, () => sections, (section) => section.title, ($$anchor, section) => {
		var section_1 = root_4();
		var h3 = $.child(section_1);
		var text = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);
		var node_1 = $.sibling(p, 2);

		{
			var consequent = ($$anchor) => {
				var ul = root_2();

				$.each(ul, 21, () => $.get(section).list, $.index, ($$anchor, item) => {
					var li = root_1();
					var text_2 = $.only_child(li, true);

					$.template_effect(() => $.set_text(text_2, $.get(item)));
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			};

			$.if(node_1, ($$render) => {
				if ($.get(section).list) $$render(consequent);
			});
		}

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_1 = ($$anchor) => {
				var p_1 = root_3();
				var a = $.child(p_1);
				var text_3 = $.only_child(a, true);

				$.reset(p_1);

				$.template_effect(() => {
					$.set_attribute(a, 'href', $.get(section).link.url);
					$.set_text(text_3, $.get(section).link.text);
				});

				$.append($$anchor, p_1);
			};

			$.if(node_2, ($$render) => {
				if ($.get(section).link) $$render(consequent_1);
			});
		}

		$.reset(section_1);

		$.template_effect(() => {
			$.set_text(text, $.get(section).title);
			$.set_text(text_1, $.get(section).content);
		});

		$.append($$anchor, section_1);
	});

	$.append($$anchor, fragment_1);
	$.pop();
}