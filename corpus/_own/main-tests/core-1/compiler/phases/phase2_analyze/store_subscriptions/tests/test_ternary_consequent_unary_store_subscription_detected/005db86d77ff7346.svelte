<script>
    import { mdScreen } from 'x';
    $: temporaryDrawer = true ? !$mdScreen : false;
</script>
<p>{temporaryDrawer}</p>
