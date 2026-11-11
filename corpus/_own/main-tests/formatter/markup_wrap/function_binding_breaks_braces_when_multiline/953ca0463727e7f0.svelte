<TextInput
  bind:value={
    () => model.data.samlMetadataUrl ?? "",
    (value) => {
      model.data.samlMetadataUrl = value;
    }
  }
/>