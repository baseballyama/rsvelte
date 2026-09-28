export class ImageUpload {
	#previewUrl = $state<null | string>(null);
	#fileName = $state<null | string>(null);
	#fileInput = $state<HTMLInputElement | null>(null);
	#files = $state<FileList | null>(null);
	#onUpload?: (url: string) => void;

	constructor(options: { initialImage?: string; onUpload?: (url: string) => void } = {}) {
		this.#onUpload = options.onUpload;
		if (options.initialImage) {
			this.#previewUrl = options.initialImage;
		}
	}

	get previewUrl() {
		return this.#previewUrl;
	}

	get fileName() {
		return this.#fileName;
	}

	get fileInput() {
		return this.#fileInput;
	}

	set fileInput(input: HTMLInputElement | null) {
		this.#fileInput = input;
	}

	get files() {
		return this.#files;
	}

	set files(files: FileList | null) {
		this.#files = files;
		const file = files?.[0];
		if (file) {
			this.#fileName = file.name;
			const url = URL.createObjectURL(file);
			if (this.#previewUrl) {
				URL.revokeObjectURL(this.#previewUrl);
			}
			this.#previewUrl = url;
			this.#onUpload?.(url);
		}
	}

	handleThumbnailClick = () => {
		this.#fileInput?.click();
	};

	handleRemove = () => {
		if (this.#previewUrl) {
			URL.revokeObjectURL(this.#previewUrl);
		}
		this.#previewUrl = null;
		this.#fileName = null;
		if (this.#fileInput) {
			this.#fileInput.value = '';
		}
		this.#files = null;
	};

	destroy() {
		if (this.#previewUrl) {
			URL.revokeObjectURL(this.#previewUrl);
		}
	}
}

export function useImageUpload(options?: {
	initialImage?: string;
	onUpload?: (url: string) => void;
}) {
	return new ImageUpload(options);
}
