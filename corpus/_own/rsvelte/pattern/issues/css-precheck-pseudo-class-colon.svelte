<!-- Unpreprocessed indented Sass: both compilers reject it, and the position is
     the comparison. Upstream reports wherever its recursive CSS parse first
     fails, which is the empty pseudo-class name after `--primary:`. A raw-text
     "first colon in the block" guess lands on `:global` instead. -->
<style lang="sass">
	:global(:root)
		--primary: #1a79ff
		color: red
</style>
