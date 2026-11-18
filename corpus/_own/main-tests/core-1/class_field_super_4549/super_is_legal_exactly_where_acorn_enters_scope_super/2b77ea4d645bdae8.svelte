<script>
class B { load(){} constructor(){} }
class C extends B { static { (function(){ super.load(); }); } }
</script>
<i>x</i>
