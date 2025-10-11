import { useCallback, useEffect, useMemo, useState } from "react";

import {
    clearImageRecords,
    createImageRecord,
    deleteImageRecord,
    listImageRecords,
    type CreateImageRecordInput,
    type ImageMetadata,
    type ImageRecord,
} from "@/services/databaseService";
import {
    clearGalleryDirectory,
    deleteImageFromGallery,
    saveImageToGallery,
    type SaveImageOptions,
} from "@/services/imageStorageService";

export interface SaveGeneratedImageInput {
	prompt: string;
	base64Data: string;
	metadata?: ImageMetadata | null;
	extension?: SaveImageOptions["extension"];
	fileName?: string;
}

interface GalleryState {
	images: ImageRecord[];
	loading: boolean;
	saving: boolean;
	error: Error | null;
}

const toCreateRecordInput = (params: SaveGeneratedImageInput, uri: string): CreateImageRecordInput => ({
	uri,
	prompt: params.prompt,
	metadata: params.metadata ?? null,
});

const normalizeError = (error: unknown): Error => {
	if (error instanceof Error) {
		return error;
	}
	return new Error(typeof error === "string" ? error : "Unknown gallery error occurred.");
};

export const useGalleryStorage = () => {
	const [state, setState] = useState<GalleryState>({
		images: [],
		loading: true,
		saving: false,
		error: null,
	});

	const refresh = useCallback(async () => {
			setState((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const records = await listImageRecords();
				setState((prev) => ({ ...prev, images: records, loading: false }));
		} catch (error) {
				setState((prev) => ({ ...prev, error: normalizeError(error), loading: false }));
		}
		}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const saveGeneratedImage = useCallback(
		async (input: SaveGeneratedImageInput): Promise<ImageRecord> => {
					setState((prev) => ({ ...prev, saving: true, error: null }));

			try {
						const { uri } = await saveImageToGallery({
					base64Data: input.base64Data,
					extension: input.extension,
					fileName: input.fileName,
				});

				const record = await createImageRecord(toCreateRecordInput(input, uri));

						setState((prev) => ({
							...prev,
							images: [record, ...prev.images],
							saving: false,
						}));

				return record;
			} catch (error) {
				const normalized = normalizeError(error);
						setState((prev) => ({ ...prev, saving: false, error: normalized }));
				throw normalized;
			}
		},
				[]
	);

	const deleteImage = useCallback(
		async (id: number): Promise<void> => {
					setState((prev) => ({ ...prev, saving: true, error: null }));

			try {
						const record = await deleteImageRecord(id);
						if (record) {
							await deleteImageFromGallery(record.uri);
						}

						setState((prev) => ({
							...prev,
							images: prev.images.filter((item) => item.id !== id),
							saving: false,
						}));
			} catch (error) {
				const normalized = normalizeError(error);
						setState((prev) => ({ ...prev, saving: false, error: normalized }));
				throw normalized;
			}
		},
				[]
	);

	const clearGallery = useCallback(async (): Promise<void> => {
				setState((prev) => ({ ...prev, saving: true, error: null }));

		try {
			await Promise.all([clearGalleryDirectory(), clearImageRecords()]);
					setState((prev) => ({ ...prev, images: [], saving: false }));
		} catch (error) {
			const normalized = normalizeError(error);
					setState((prev) => ({ ...prev, saving: false, error: normalized }));
			throw normalized;
		}
			}, []);

	const hasImages = useMemo(() => state.images.length > 0, [state.images]);

	return {
		images: state.images,
		loading: state.loading,
		saving: state.saving,
		error: state.error,
		hasImages,
		refresh,
		saveGeneratedImage,
		deleteImage,
		clearGallery,
	} as const;
};

export type GalleryImageRecord = ImageRecord;
export type GalleryImageMetadata = ImageMetadata;
