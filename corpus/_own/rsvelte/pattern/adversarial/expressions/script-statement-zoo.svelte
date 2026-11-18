<script>
	let n = $state(0);

	outer: for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 2; j++) {
			if (j) continue outer;
			break outer;
		}
	}

	function* gen() {
		yield 1;
		yield* [2, 3];
	}

	async function* agen() {
		yield await Promise.resolve(1);
	}

	class WithStatic {
		static #secret = 1;
		static {
			WithStatic.ready = true;
		}
		static get secret() {
			return WithStatic.#secret;
		}
	}

	try {
		null?.x;
	} catch {
		// no binding
	} finally {
		void 0;
	}

	switch (n) {
		case 0: {
			const scoped = 1;
			void scoped;
			break;
		}
		default:
	}

	do {
		n = n;
	} while (false);

	const [a = 1, , ...restArr] = [undefined, 2, 3, 4];
	const { p: { q = 5 } = {}, ...restObj } = { p: {}, z: 1 };
</script>

<p>{[...gen()].join(',')} {typeof agen} {WithStatic.secret} {String(WithStatic.ready)}</p>
<p>{a} {restArr.join('')} {q} {Object.keys(restObj).length} {n}</p>
