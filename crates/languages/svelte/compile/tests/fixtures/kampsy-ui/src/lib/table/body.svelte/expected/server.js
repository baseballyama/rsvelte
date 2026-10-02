import * as $ from 'svelte/internal/server';

export default function Body($$renderer, $$props) {
	let {
		striped = undefined,
		interactive = undefined,
		children = undefined
	} = $$props;

	let stripedClass = $.derived(() => {
		if (striped) {
			return `[&_tr:where(:nth-child(odd))]:bg-kui-light-bg-secondary dark:[&_tr:where(:nth-child(odd))]:bg-kui-dark-bg-secondary`;
		}

		return "";
	});

	let interactiveClass = $.derived(() => {
		if (interactive) {
			return `[&_tr:hover]:bg-kui-light-gray-200 dark:[&_tr:hover]:bg-kui-dark-gray-200`;
		}

		return "";
	});

	let bodyClass = $.derived(() => {
		return `${stripedClass()} ${interactiveClass()}`;
	});

	$$renderer.push(`<tbody aria-hidden="true" class="table-row h-3"></tbody> <tbody${$.attr_class(` ${$.stringify(bodyClass())} [&_td:first-child]:rounded-l [&_td:last-child]:rounded-r`)}>`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></tbody>`);
}