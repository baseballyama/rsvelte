<script>
class B { load(){} constructor(){} }
class C extends B { [super.load()] = 1; }
</script>
<i>x</i>
