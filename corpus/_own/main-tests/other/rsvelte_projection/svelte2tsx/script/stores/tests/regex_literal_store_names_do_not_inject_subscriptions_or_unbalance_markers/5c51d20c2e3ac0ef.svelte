<script>
export let mystore;
const re = /\$mystore/;
const inClass = /[/]\$mystore/;
const escaped = /a\/b\$mystore/;
const afterDivision = 6 / 2 / /\$mystore/.source.length;
const other = writable(0);
$other;
</script>
<b>{mystore}{re.source}{inClass.source}{escaped.source}{afterDivision}</b>