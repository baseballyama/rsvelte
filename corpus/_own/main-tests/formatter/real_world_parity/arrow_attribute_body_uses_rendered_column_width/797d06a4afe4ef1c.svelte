<script lang="ts"></script>

<section>
  <div>
    <div>
      <Modal
        onsubmit={async (enableEmbedding: boolean) => {
          try {
            await persistAiGrouping(enableEmbedding);
          } catch (err) {
            const fallbackMessage = enableEmbedding ? '類似検索の有効化または作成に失敗しました' : '作成に失敗しました';
            const queryWithExclusions = buildQueryWithExcludedRecords(baseQuery, excludedRecordIds);
            const res = await backendClient.api.v1['table-records'][':tableId']['bulk-delete'].$post({
              param: { tableId },
            });
            if (field.maxSelectionCount === 1 && currentValue.length === 1 && diff.added.length > 0) {
              return;
            }
          }
        }}
      />
    </div>
  </div>
</section>
