<script>
	class M {
		wide = $state({
			a: 1,
			b: 2,
		});

		// a leading comment
		afterComment = $state(0); // and a trailing one

		/* block */ mid = $state(
			// inside the call
			1
		);

		fn = $derived.by(() => {
			// a } brace and a ; semicolon in a comment
			return this.afterComment + 1;
		});

		bump() {
			this.afterComment += 1;
			this.wide = { ...this.wide, a: this.wide.a + 1 };
		}
	}

	const m = new M();
</script>

<button onclick={() => m.bump()}>{m.wide.a}{m.afterComment}{m.mid}{m.fn}</button>
