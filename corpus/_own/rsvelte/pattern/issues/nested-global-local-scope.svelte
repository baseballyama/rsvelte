<main><button>save</button></main>

<style>
	:global(.external) {
		&:hover {
			color: red;
		}

		& {
			--nested-global-pin: 1;
		}
	}

	:global(.leaf):hover {
		color: blue;
	}
</style>
