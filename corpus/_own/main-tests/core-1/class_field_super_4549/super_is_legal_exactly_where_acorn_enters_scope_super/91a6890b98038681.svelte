<script>
class B { load(){} constructor(){} }
class C extends B { m(){ return function(){ super.load(); }; } }
</script>
<i>x</i>
