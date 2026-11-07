import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/Icon.svelte';

var root = $.from_html(`<a target="_blank" class="social-icon svelte-c97hjm"><!></a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function HostSocialLink($$anchor, $$props) {
	$.push($$props, true);

	// if url is not prefixed with https, add it
	const httpHostUrl = $$props.host.url && (/https?\:/).test($$props.host.url) ? $$props.host.url : `https://${$$props.host.url}`;

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var node_1 = $.child(a);

			{
				let $0 = $.derived(() => `${$$props.host.name} on X`);

				Icon(node_1, {
					name: 'x',
					get title() {
						return $.get($0);
					}
				});
			}

			$.reset(a);
			$.template_effect(() => $.set_attribute(a, 'href', `https://x.com/${$$props.host.twitter}`));
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.host.twitter) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root();
			var node_3 = $.child(a_1);

			{
				let $0 = $.derived(() => `${$$props.host.name} on GitHub`);

				Icon(node_3, {
					name: 'github',
					get title() {
						return $.get($0);
					}
				});
			}

			$.reset(a_1);
			$.template_effect(() => $.set_attribute(a_1, 'href', `https://github.com/${$$props.host.github}`));
			$.append($$anchor, a_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.host.github) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var a_2 = root();
			var node_5 = $.child(a_2);

			{
				let $0 = $.derived(() => `${$$props.host.name}'s website'`);

				Icon(node_5, {
					name: 'monitor',
					get title() {
						return $.get($0);
					}
				});
			}

			$.reset(a_2);
			$.template_effect(() => $.set_attribute(a_2, 'href', httpHostUrl));
			$.append($$anchor, a_2);
		};

		$.if(node_4, ($$render) => {
			if ($$props.host.url) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}