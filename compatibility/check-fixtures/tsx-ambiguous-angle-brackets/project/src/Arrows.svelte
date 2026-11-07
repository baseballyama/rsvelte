<script lang="ts">
	const id = <T>(x: T): T => x; const wrong: number = id('after the comma');
	const frozen = <const T>(x: T) => x;
	const later = async <T>(x: T) => x;
	const defaulted = <T = string>(x: T) => x;
	const bounded = <T extends string>(x: T) => x;
	const already = <T,>(x: T) => x;
	const commented = <T /* , */>(x: T) => x;
	const lineCommented = <T // a comment that hides the comma
	,>(x: T) => x;
	const outer = <T>(x: T) => {
		const inner = <U>(y: U) => [x, y] as const;
		return inner;
	};
	class Holder {
		pick = <K>(k: K) => k;
	}
	const count: string = [frozen(1), later(1), defaulted('d'), bounded('b'), already(1), commented(1), lineCommented(1), outer(1)(2), new Holder().pick(1)].length;
</script>

<p>{wrong}{count}</p>
