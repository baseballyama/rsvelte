<script>let count = 0;
function sideEffect(x){}
$: { sideEffect(count); }</script>