import * as $ from 'svelte/internal/server';
import { getStringWidth } from "$lib/utils/text.js";

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			position = "top",
			text,
			type = undefined,
			class: klass = "",
			children = undefined
		} = $$props;

		let widthClass = "width:250px";

		// 24 is for the left 12px and right 12px padding
		const positionObj = {
			top: `bottom-[125%] left-[50%] translate-x-[-50%] text-kui-dark-gray-1000
				dark:text-kui-light-gray-1000 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 after:content-[' ']
				after:absolute after:top-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-kui-light-gray-1000 dark:after:!border-t-kui-dark-gray-1000 after:!border-b-transparent
				after:!border-x-transparent `,

			bottom: `top-[125%] left-[50%] translate-x-[-50%] text-kui-dark-gray-1000
				dark:text-kui-light-gray-1000 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 after:content-[' ']
				after:absolute after:bottom-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-transparent after:!border-b-kui-light-gray-1000 dark:after:!border-b-kui-dark-gray-1000
				after:!border-x-transparent dark:after:!border-transparent`,

			left: `top-[50%] right-[125%] transform translate-y-[-50%] text-kui-dark-gray-1000
				dark:text-kui-light-gray-1000 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 after:content-[' ']
				after:absolute after:top-[50%] after:left-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-kui-light-gray-1000
				dark:after:!border-l-kui-dark-gray-1000 after:!border-r-transparent`,

			right: `top-[50%] left-[125%] transform translate-y-[-50%] text-kui-dark-gray-1000
				dark:text-kui-light-gray-1000 bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 after:content-[' ']
				after:absolute after:top-[50%] after:right-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-transparent after:!border-r-kui-light-gray-1000
				dark:after:!border-r-kui-dark-gray-1000`
		};

		let positionStyle = $.derived(() => {
			return positionObj[position];
		});

		const typeObj = {
			success: {
				top: `bottom-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 after:content-[' ']
				after:absolute after:top-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-kui-light-blue-700 dark:after:!border-t-kui-dark-blue-700 after:!border-b-transparent
				after:!border-x-transparent `,

				bottom: `top-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 after:content-[' ']
				after:absolute after:bottom-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-transparent after:!border-b-kui-light-blue-700 dark:after:!border-b-kui-dark-blue-700
				after:!border-x-transparent `,

				left: `top-[50%] right-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 after:content-[' ']
				after:absolute after:top-[50%] after:left-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-kui-light-blue-700
				dark:after:!border-l-kui-dark-blue-700 after:!border-r-transparent`,

				right: `top-[50%] left-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 after:content-[' ']
				after:absolute after:top-[50%] after:right-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-transparent after:!border-r-kui-light-blue-700
				dark:after:!border-r-kui-dark-blue-700`
			},
			error: {
				top: `bottom-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-red-700 dark:bg-kui-dark-red-700 after:content-[' ']
				after:absolute after:top-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-kui-light-red-700 dark:after:!border-t-kui-dark-red-700 after:!border-b-transparent
				after:!border-x-transparent `,

				bottom: `top-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-red-700 dark:bg-kui-dark-red-700 after:content-[' ']
				after:absolute after:bottom-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-transparent after:!border-b-kui-light-red-700 dark:after:!border-b-kui-dark-red-700
				after:!border-x-transparent `,

				left: `top-[50%] right-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-red-700 dark:bg-kui-dark-red-700 after:content-[' ']
				after:absolute after:top-[50%] after:left-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-kui-light-red-700
				dark:after:!border-l-kui-dark-red-700 after:!border-r-transparent`,

				right: `top-[50%] left-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-red-700 dark:bg-kui-dark-red-700 after:content-[' ']
				after:absolute after:top-[50%] after:right-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-transparent after:!border-r-kui-light-red-700
				dark:after:!border-r-kui-dark-red-700`
			},
			warning: {
				top: `bottom-[125%] left-[50%] translate-x-[-50%] text-kui-light-black
				dark:text-black bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 after:content-[' ']
				after:absolute after:top-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-kui-light-amber-700 dark:after:!border-t-kui-dark-amber-700 after:!border-b-transparent
				after:!border-x-transparent `,

				bottom: `top-[125%] left-[50%] translate-x-[-50%] text-kui-light-black
				dark:text-black bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 after:content-[' ']
				after:absolute after:bottom-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-transparent after:!border-b-kui-light-amber-700 dark:after:!border-b-kui-dark-amber-700
				after:!border-x-transparent `,

				left: `top-[50%] right-[125%] transform translate-y-[-50%] text-kui-light-black
				dark:text-black bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 after:content-[' ']
				after:absolute after:top-[50%] after:left-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-kui-light-amber-700
				dark:after:!border-l-kui-dark-amber-700 after:!border-r-transparent`,

				right: `top-[50%] left-[125%] transform translate-y-[-50%] text-kui-light-black
				dark:text-black bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 after:content-[' ']
				after:absolute after:top-[50%] after:right-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-transparent after:!border-r-kui-light-amber-700
				dark:after:!border-r-kui-dark-amber-700`
			},
			violet: {
				top: `bottom-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 after:content-[' ']
				after:absolute after:top-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-kui-light-purple-700 dark:after:!border-t-kui-dark-purple-700 after:!border-b-transparent
				after:!border-x-transparent `,

				bottom: `top-[125%] left-[50%] translate-x-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 after:content-[' ']
				after:absolute after:bottom-full after:left-[50%] after:ml-[-5px] after:border-[5px]
				after:!border-t-transparent after:!border-b-kui-light-purple-700 dark:after:!border-b-kui-dark-purple-700
				after:!border-x-transparent `,

				left: `top-[50%] right-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 after:content-[' ']
				after:absolute after:top-[50%] after:left-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-kui-light-purple-700
				dark:after:!border-l-kui-dark-purple-700 after:!border-r-transparent`,

				right: `top-[50%] left-[125%] transform translate-y-[-50%] text-kui-light-bg
				dark:text-kui-light-bg bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 after:content-[' ']
				after:absolute after:top-[50%] after:right-full after:mt-[-5px] after:border-[5px]
				after:!border-y-transparent after:!border-l-transparent after:!border-r-kui-light-purple-700
				dark:after:!border-r-kui-dark-purple-700`
			}
		};

		let typeStyle = $.derived(() => {
			if (type && position) {
				return typeObj[type][position];
			}

			return "";
		});

		let tooltipStyle = $.derived(() => {
			if (type) {
				return typeStyle();
			}

			return `${positionStyle()}`;
		});

		$$renderer.push(`<span><span${$.attr_class(`group text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 relative w-auto cursor-pointer ${$.stringify(klass)}`)}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attr_style(widthClass)}${$.attr_class(` invisible absolute group-hover:visible ${$.stringify(tooltipStyle())} z-1000 rounded-sm px-3 py-1.5 text-center text-xs`)}>${$.escape(text || "")}</span></span></span>`);
	});
}