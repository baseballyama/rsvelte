<script>
	import FancyList from 'mod'
</script>
<FancyList let:foo={data}>
	{data}
	<div slot="item" let:item let:item2 class={item2.class}>
		{item.text}
	</div>
</FancyList>
