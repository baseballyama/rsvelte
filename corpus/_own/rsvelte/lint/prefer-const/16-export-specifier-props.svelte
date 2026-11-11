<script>
	let className = undefined;
	export { className as class };
	let plainExport = 1;
	export { plainExport };
	let notExported = 2;
	let pairA = 3,
		pairB = 4;
	export { pairA };
	let { deA, deB } = { deA: 5, deB: 6 };
	export { deA };
	function scoped() {
		let className = 7;
		void className;
	}
	void [notExported, pairB, deB, scoped];
</script>
<p>{className}</p>
