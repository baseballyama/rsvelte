<script>
	// title={title} inside a comment must not matter
	let title = 'title';
	let dataX = "{'title'}";
</script>

<!-- title={title} in an html comment -->
<div data-x="{'title'}" data-y="title={title}">c</div>
<div title="title">d</div>
