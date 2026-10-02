<script>
const transition = (node, params) => ({
	delay: 42,
	duration: 42,
	easing: (t) => 42,
	css: (t, u) => 42,
	tick: (t, u) => {}
})
</script>
<div transition:fn/>
<div transition:fn={params}/>
<div transition:fn|local/>
<div transition:fn|local={params}/>
