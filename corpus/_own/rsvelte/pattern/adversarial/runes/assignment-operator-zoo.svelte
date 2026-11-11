<script>
	let n = $state(8);
	let s = $state('a');
	let maybe = $state(null);
	let obj = $state({ bits: 0b1100, key: 'bits' });

	function grind() {
		n **= 2;
		n %= 100;
		n >>>= 1;
		n <<= 1;
		n >>= 1;
		n &= 0xff;
		n |= 0b10;
		n ^= 0b01;
		s += '!';
		s &&= s.toUpperCase();
		maybe ||= 'filled';
		maybe ??= 'never';
		obj.bits **= 2;
		obj.bits >>>= 2;
		obj[obj.key] ??= 1;
		obj[obj.key] &&= 3;
	}
</script>

<button onclick={grind}>{n}:{s}:{maybe}:{obj.bits}</button>
