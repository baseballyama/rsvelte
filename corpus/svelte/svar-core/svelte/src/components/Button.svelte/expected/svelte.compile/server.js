import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = "",
			css = "",
			icon = "",
			disabled = false,
			title = "",
			tooltip,
			text = "",
			children,
			onclick
		} = $$props;

		let buttonCss = $.derived(() => {
			let cssType = type
				? type.split(" ").filter((a) => a !== "").map((x) => "wx-" + x).join(" ")
				: "";

			return css + (css ? " " : "") + cssType;
		});

		const handleClick = (ev) => {
			onclick && onclick(ev);
		};

		$$renderer.push(`<button${$.attr('title', title)}${$.attr_class(`wx-button ${buttonCss()}`, 'svelte-1s0tks0', { 'wx-icon': icon && !children })}${$.attr('disabled', disabled, true)}${$.attr('data-tooltip-text', tooltip)}>`);

		if (icon) {
			$$renderer.push(`<!--[0--><i${$.attr_class($.clsx(icon), 'svelte-1s0tks0')}></i>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(text)}`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}