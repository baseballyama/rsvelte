import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { spinner } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			type = "default",
			color = "primary",
			size = "8",
			class: className,
			currentFill = "inherit",
			currentColor = "currentColor",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("spinner"));
		let spinnerClass = $.derived(() => spinner({ type, color, size, class: clsx(theme(), className) }));

		if (type === "default") {
			$$renderer.push(`<!--[0--><svg${$.attributes(
				{
					...restProps,
					role: 'status',
					class: $.clsx(spinnerClass()),
					viewBox: '0 0 100 101',
					fill: 'none'
				},
				void 0,
				void 0,
				void 0,
				3
			)}><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"${$.attr('fill', currentColor)}></path><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"${$.attr('fill', currentFill)}></path></svg>`);
		} else if (type === "dots") {
			$$renderer.push(`<!--[1--><svg${$.attributes(
				{
					...restProps,
					role: 'status',
					class: $.clsx(spinnerClass()),
					viewBox: '0 0 120 30',
					fill: 'currentColor'
				},
				void 0,
				void 0,
				void 0,
				3
			)}><circle cx="15" cy="15" r="15"><animate attributeName="r" values="15;9;15" dur="0.8s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values="1;.5;1" dur="0.8s" repeatCount="indefinite"></animate></circle><circle cx="60" cy="15" r="9" fill-opacity="0.3"><animate attributeName="r" values="9;15;9" dur="0.8s" begin="0.2s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values=".5;1;.5" dur="0.8s" begin="0.2s" repeatCount="indefinite"></animate></circle><circle cx="105" cy="15" r="15"><animate attributeName="r" values="15;9;15" dur="0.8s" begin="0.4s" repeatCount="indefinite"></animate><animate attributeName="fill-opacity" values="1;.5;1" dur="0.8s" begin="0.4s" repeatCount="indefinite"></animate></circle></svg>`);
		} else if (type === "bars") {
			$$renderer.push(`<!--[2--><svg${$.attributes(
				{
					...restProps,
					role: 'status',
					class: $.clsx(spinnerClass()),
					viewBox: '0 0 135 140',
					fill: 'currentColor'
				},
				void 0,
				void 0,
				void 0,
				3
			)}><rect y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" repeatCount="indefinite"></animate></rect><rect x="30" y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" begin="0.2s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" begin="0.2s" repeatCount="indefinite"></animate></rect><rect x="60" y="10" width="15" height="120" rx="6"><animate attributeName="height" values="120;60;120" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animate><animate attributeName="y" values="10;40;10" dur="1.2s" begin="0.4s" repeatCount="indefinite"></animate></rect></svg>`);
		} else if (type === "pulse") {
			$$renderer.push(`<!--[3--><svg${$.attributes(
				{
					...restProps,
					role: 'status',
					class: $.clsx(spinnerClass()),
					viewBox: '0 0 100 100'
				},
				void 0,
				void 0,
				void 0,
				3
			)}><circle cx="50" cy="50" r="8"${$.attr('fill', currentFill)}><animate attributeName="r" values="8;45" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="50" cy="50" r="8"${$.attr('fill', currentFill)}><animate attributeName="r" values="8;45" begin="0.5s" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" begin="0.5s" dur="1.5s" repeatCount="indefinite"></animate></circle><circle cx="50" cy="50" r="8"${$.attr('fill', currentFill)}><animate attributeName="r" values="8;45" begin="1s" dur="1.5s" repeatCount="indefinite"></animate><animate attributeName="opacity" values="0.9;0" begin="1s" dur="1.5s" repeatCount="indefinite"></animate></circle></svg>`);
		} else if (type === "orbit") {
			$$renderer.push(`<!--[4--><svg${$.attributes(
				{
					...restProps,
					role: 'status',
					class: $.clsx(spinnerClass()),
					viewBox: '0 0 100 100',
					fill: 'currentColor'
				},
				void 0,
				void 0,
				void 0,
				3
			)}><g><circle cx="50" cy="20" r="8"></circle><circle cx="73.66" cy="65" r="8"></circle><circle cx="26.34" cy="65" r="8"></circle><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.2s" repeatCount="indefinite"></animateTransform></g></svg>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}