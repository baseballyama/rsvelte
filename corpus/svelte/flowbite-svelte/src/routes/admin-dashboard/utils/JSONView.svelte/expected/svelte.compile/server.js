import * as $ from 'svelte/internal/server';

export default function JSONView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Updated props data interface to match your actual data structure exactly
		// This matches your actual data structure
		// Component props
		let { data, initiallyExpanded = false } = $$props;

		// State
		let expanded = false;

		// Toggle expanded state
		function toggle() {
			expanded = !expanded;
		}

		// Check if a prop has a default value
		function hasDefaultValue(propArray) {
			// Check if there is a second element and it's not an empty string
			return propArray.length > 1 && propArray[1] !== "";
		}

		$$renderer.push(`<div class="json-view my-2 mb-8 overflow-hidden rounded-md border border-gray-200 bg-gray-50"><button class="toggle-btn flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-100"><div class="flex items-center gap-2"><span class="text-gray-600">${$.escape(expanded ? "▼" : "►")}</span> <span class="font-medium">${$.escape(data.name)}</span> <a${$.attr('href', data.type.link)} target="_blank" rel="noopener noreferrer" class="ml-2 text-sm text-blue-600 hover:underline">Type: ${$.escape(data.type.name)}</a></div> <span class="text-sm text-gray-500">${$.escape(data.props.length)} props</span></button> `);

		if (expanded) {
			$$renderer.push(`<!--[0--><div class="props-content border-t border-gray-200">`);

			if (data.props.length === 0) {
				$$renderer.push(`<!--[0--><div class="p-3 text-sm text-gray-500 italic">No props available</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="p-2"><!--[-->`);

				const each_array = $.ensure_array_like(data.props);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let propArray = each_array[$$index];

					$$renderer.push(`<div class="prop-item flex rounded p-1.5 text-sm hover:bg-gray-100"><div class="prop-name flex-grow font-mono text-violet-700">${$.escape(propArray[0])}</div> `);

					if (hasDefaultValue(propArray)) {
						$$renderer.push(`<!--[0--><div class="prop-value text-gray-600">default: <span class="font-mono">${$.escape(propArray[1])}</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}