<script>
	import FancyList from 'mod'
</script>
<FancyList let:foo={data}>
	{data}
	<div slot="item" let:item let:item2 let:item3={bar}>
		{item.text}
	</div>
	{item} no-def
</FancyList>
{data} no-def
