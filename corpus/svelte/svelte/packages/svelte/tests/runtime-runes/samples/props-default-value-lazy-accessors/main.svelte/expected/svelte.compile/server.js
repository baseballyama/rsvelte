import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let log = [];
	const fallback_value = 1;

	const nested = {
		get fallback_value() {
			log.push('nested.fallback_value');

			return fallback_value;
		}
	};

	const fallback_fn = () => {
		log.push('fallback_fn');

		return fallback_value;
	};

	const {
		p0 = 1,
		p1 = fallback_value,
		p2 = nested.fallback_value,
		p3 = fallback_fn(),
		p4 = 1,
		p5 = fallback_value,
		p6 = nested.fallback_value,
		p7 = fallback_fn()
	} = $$props;

	$$renderer.push(`<p>props: ${$.escape(p0)} ${$.escape(p1)} ${$.escape(p2)} ${$.escape(p3)} ${$.escape(p4)} ${$.escape(p5)} ${$.escape(p6)} ${$.escape(p7)}</p> <p>log: ${$.escape(log)}</p>`);
}