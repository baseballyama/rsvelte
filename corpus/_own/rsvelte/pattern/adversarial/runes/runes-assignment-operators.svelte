<script>
	let n = $state(0);
	let o = $state({ k: 0, arr: [0] });
	let s = $state('a');

	function all() {
		n += 1;
		n -= 1;
		n *= 2;
		n /= 2;
		n %= 3;
		n **= 2;
		n <<= 1;
		n >>= 1;
		n >>>= 1;
		n &= 7;
		n |= 8;
		n ^= 1;
		n &&= 1;
		n ||= 2;
		n ??= 3;
		n++;
		++n;
		n--;
		--n;
		o.k += 1;
		o.arr[0] ??= 5;
		o['k'] ||= 6;
		s += 'b';
		[n, o.k] = [o.k, n];
		({ k: o.k } = { k: n });
	}
</script>

<button onclick={all}>{n}{o.k}{o.arr[0]}{s}</button>
