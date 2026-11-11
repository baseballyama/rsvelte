<script>
	let v = $state(1);

	function heads(o) {
		if (({ v } = o)) return v;
		while (({ v } = o)) break;
		do break;
		while (({ v } = o));
		switch (({ v } = o)) {
			default:
				break;
		}
		for (({ v } = o); false; ) break;
		for (let i = 0; i < 1; ({ v } = o)) i++;
		if (({ v } = o.inner)) return v;
		if ((([ v ] = o.list))) return v;
		return ({ v } = o);
	}

	function keywords(o) {
		if (!o) ({ v } = o);
		else ({ v } = o);

		switch (1) {
			case 1:
				({ v } = o);
				break;
			default:
				({ v } = o);
		}

		throw ({ v } = o.inner);
	}

	function not_heads(o) {
		if (({ v } = o) && 1) return v;
		if (1 && ({ v } = o)) return v;
		if ((({ v } = o), 1)) return v;
		const r = ({ v } = o);
		return String(1, ({ v } = o)) + r + heads(o) + keywords(o);
	}
</script>

<button onclick={() => not_heads({ v: 3, list: [4], inner: { v: 5 } })}></button>
{v}
