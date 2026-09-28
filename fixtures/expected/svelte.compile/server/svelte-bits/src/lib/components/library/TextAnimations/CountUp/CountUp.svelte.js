import * as $ from 'svelte/internal/server';
import { animate } from 'motion';

export default function CountUp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			to,
			from = 0,
			direction = 'up',
			delay = 0,
			duration = 2,
			class: className = '',
			startWhen = true,
			separator = '',
			onStart,
			onEnd
		} = $$props;

		let spanEl = void 0;
		let inView = false;

		function getDecimalPlaces(num) {
			const str = num.toString();

			if (str.includes('.')) {
				const decimals = str.split('.')[1];

				if (parseInt(decimals) !== 0) return decimals.length;
			}

			return 0;
		}

		const maxDecimals = $.derived(() => Math.max(getDecimalPlaces(from), getDecimalPlaces(to)));

		function formatValue(latest, decimals, sep) {
			const hasDecimals = decimals > 0;

			const options = {
				useGrouping: !!sep,
				minimumFractionDigits: hasDecimals ? decimals : 0,
				maximumFractionDigits: hasDecimals ? decimals : 0
			};

			const formatted = Intl.NumberFormat('en-US', options).format(latest);

			return sep ? formatted.replace(/,/g, sep) : formatted;
		}

		$$renderer.push(`<span${$.attr_class($.clsx(className))}></span>`);
	});
}