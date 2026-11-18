<script lang="ts">
import {
} from '@tabler/icons-svelte';
const localizedPresets = $derived(
	contentFilter.presets.map((preset) => {
		return {
		};
	}),
);
function addKeyword() {
	if (
		!importButtonElement.contains(event.target as Node)
	) {
		if (confirmEl && !confirmEl.contains(event.target as Node)) {
		}
	}
}
$effect(() => {
});
</script>
<div class="space-y-6">
  <div class="text-sm text-gray-600 dark:text-gray-400">
  </div>
  {#if contentFilter.keywords.length > 0}
    <div>
      {#each contentFilter.activePresets as presetId}
        {#if preset}
          <div class="mb-3">
            <div class="flex flex-wrap gap-2">
              {#each getPresetKeywords(preset) as keyword}
                <span
                >
                </span>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
      {#if customKeywords.length > 0}
        <div class="mb-3">
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {#each customKeywords as keyword}
              <span
                >
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
    <div class="space-y-2">
    <div>
    </div>
    <button
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
    <div class="flex gap-3 relative">
      {#if showImportConfirm}
        <div
        >
          <div
          >
            {#if importWarning}
              <div
              >
                <p class="text-xs text-yellow-800 dark:text-yellow-300">
                  ⚠️ {importWarning}
                </p>
              </div>
            {/if}
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {s("settings.contentFilter.importConfirm.backup") ||
                "Tip: Export your current settings first to create a backup."}
            </p>
            <div class="flex gap-2 justify-end">
              <button
                onclick={() => {
                  showImportConfirm = false;
                  if (fileInputElement) fileInputElement.value = "";
                }}
              >
            </div>
          </div>
        </div>
      {/if}
    </div>
    {#if showResetConfirm}
      <div
      >
        <div
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
        </div>
      </div>
    {/if}
  </div>
</div>