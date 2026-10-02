<script>
    let { horizUnused, rendererCell, aggregatorCell, outputCell, unusedAttrsCell, colAttrsCell, rowAttrsCell } =
        $props();
</script>

{#if horizUnused}
    <table class="pvtUi">
        <tbody>
            <tr>
                <td class="pvtRenderers">{@render rendererCell()}</td>
                <td class="pvtAxisContainer pvtUnused pvtHorizList">{@render unusedAttrsCell()}</td>
            </tr>
            <tr>
                <td class="pvtVals">{@render aggregatorCell()}</td>
                <td class="pvtAxisContainer pvtHorizList pvtCols">{@render colAttrsCell()}</td>
            </tr>
            <tr>
                <td class="pvtAxisContainer pvtVertList pvtRows">{@render rowAttrsCell()}</td>
                <td class="pvtOutput">{@render outputCell()}</td>
            </tr>
        </tbody>
    </table>
{:else}
    <table class="pvtUi">
        <tbody>
            <tr>
                <td class="pvtRenderers">{@render rendererCell()}</td>
                <td class="pvtVals">{@render aggregatorCell()}</td>
                <td class="pvtAxisContainer pvtHorizList pvtCols">{@render colAttrsCell()}</td>
            </tr>
            <tr>
                <td class="pvtAxisContainer pvtUnused pvtVertList">{@render unusedAttrsCell()}</td>
                <td class="pvtAxisContainer pvtVertList pvtRows">{@render rowAttrsCell()}</td>
                <td class="pvtOutput">{@render outputCell()}</td>
            </tr>
        </tbody>
    </table>
{/if}
