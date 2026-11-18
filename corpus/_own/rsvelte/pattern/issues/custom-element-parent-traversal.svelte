<script>
	let n = $state(0);
</script>

<!-- an attribute-free custom element: nothing to apply, so the ancestors stay static -->
<div>
	<span>a</span>
	<div>
		<media-a></media-a>
	</div>
</div>

<!-- one attribute is enough to make every ancestor dynamic, because a custom
     element takes its attributes through properties -->
<div>
	<span>b</span>
	<div>
		<media-b foo="1"></media-b>
	</div>
</div>

<!-- the same, through `is=` rather than a dashed name -->
<div>
	<span>c</span>
	<div>
		<button is="my-btn"></button>
	</div>
</div>

<!-- attribute-free, but the fragment is dynamic on its own account -->
<div>
	<span>d</span>
	<div>
		<media-d>{n}</media-d>
	</div>
</div>

<!-- attribute-free and nested: neither level may traverse -->
<div>
	<span>e</span>
	<div>
		<media-e><media-f></media-f></media-e>
	</div>
</div>

<!-- no custom element anywhere: the plain control -->
<div>
	<span>f</span>
	<div>
		<i></i>
	</div>
</div>
