<script>
	class A {
		held = $state(class {
			deep = $state(1);
		});
	}

	void A;
</script>
