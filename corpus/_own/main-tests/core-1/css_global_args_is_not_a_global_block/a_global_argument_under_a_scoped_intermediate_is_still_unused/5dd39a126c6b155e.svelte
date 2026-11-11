<div>x</div>
<style>
	div {
		:not(span > *) {
			:where(:global(form)) { color: red; }
		}
	}
</style>
