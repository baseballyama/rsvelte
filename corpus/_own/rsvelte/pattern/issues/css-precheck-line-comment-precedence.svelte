<!-- Same shape with a later SCSS line comment: the `//` is a real CSS error,
     but it is not the FIRST one, so preferring it reports past the divergence
     upstream stops at. -->
<style lang="sass">
	:global(:root)
		--primary: #1a79ff

		// for demo editing
		--bg: #fff
</style>
