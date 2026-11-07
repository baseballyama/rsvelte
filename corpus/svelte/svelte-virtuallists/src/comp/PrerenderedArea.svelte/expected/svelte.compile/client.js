import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser, dev } from '$app/environment';

var root = $.from_html(`<div role="presentation"><!></div>`);

export default function PrerenderedArea($$anchor, $$props) {
	$.push($$props, true);

	/** For dev mode, to work with hot reload, you want to see if the content has been changed. */
	/** ID of the area, so there will be no collision. */
	const getIdFull = (id) => `prerendered_area_${id}`;

	function getArea() {
		if (!browser) {
			return null;
		}

		// otherwise
		const element = document.getElementById(getIdFull($$props.id));

		if (element) {
			if (!dev || element.hasAttribute('data-content') && element.getAttribute('data-content') === $$props.content) {
				return element;
			}
		}
	}

	/** Capture area on initialization (only in browser), before mounting! */
	const area = getArea();

	let duplicatedChildren = null;

	if (area) {
		const childs = area.childNodes;

		duplicatedChildren = Array.from(childs).map((child) => child.cloneNode(true));
	}

	const areaAction = (node) => {
		// After mounting, we need to fill the new area with the prerendered one clones
		if (area !== null) {
			duplicatedChildren?.forEach((child) => {
				node.appendChild(child);
			});
		}
	};

	var div = root();
	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (area === null) $$render(consequent);
		});
	}

	$.reset(div);
	$.action(div, ($$node) => areaAction?.($$node));

	$.template_effect(
		($0) => {
			$.set_attribute(div, 'id', $0);
			$.set_attribute(div, 'data-content', dev ? $$props.content : undefined);
		},
		[() => getIdFull($$props.id)]
	);

	$.append($$anchor, div);
	$.pop();
}