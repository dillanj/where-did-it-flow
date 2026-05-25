import { Runner, Signal } from "@tcn/state";
import { AppError } from "../../shared/errors/app-error";
import {
  createEmptyColumnMapping,
  type ColumnMapping,
  type CsvUploadResult,
  type UploadImportResult,
  type UploadPreview,
} from "./domain-model";
import type { CsvImportApiPort } from "./domain-ports";

export class MappingPreviewDomain {
  private readonly _api: CsvImportApiPort;

  readonly contextUploadId = new Signal<string | null>(null);
  readonly headers = new Signal<string[]>([]);
  readonly sampleRows = new Signal<Record<string, string>[]>([]);
  readonly mapping = new Signal<ColumnMapping>(createEmptyColumnMapping());
  readonly preview = new Signal<UploadPreview | null>(null);
  readonly importResult = new Signal<UploadImportResult | null>(null);
  readonly message = new Signal<string | null>(null);

  readonly previewRunner = new Runner<void>(undefined);
  readonly importRunner = new Runner<void>(undefined);

  constructor(input: { api: CsvImportApiPort }) {
    this._api = input.api;
  }

  setUploadContext = (upload: CsvUploadResult) => {
    const guessedMapping = this._guessMappingFromHeaders(upload.headers);

    this.contextUploadId.set(upload.id);
    this.headers.set(upload.headers);
    this.sampleRows.set(upload.sampleRows);
    this.mapping.set({
      ...createEmptyColumnMapping(),
      ...guessedMapping,
    });
    this.preview.set(null);
    this.importResult.set(null);
    this.message.set("CSV uploaded. Review mapping and run preview.");
  };

  clearForSelectedUploadChange = () => {
    this.contextUploadId.set(null);
    this.headers.set([]);
    this.sampleRows.set([]);
    this.mapping.set(createEmptyColumnMapping());
    this.preview.set(null);
    this.importResult.set(null);
    this.message.set("Select a newly uploaded CSV to map and preview.");
  };

  clearForSelectedAccountChange = () => {
    this.contextUploadId.set(null);
    this.headers.set([]);
    this.sampleRows.set([]);
    this.mapping.set(createEmptyColumnMapping());
    this.preview.set(null);
    this.importResult.set(null);
    this.message.set(null);
  };

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this.mapping.set({
      ...this.mapping.get(),
      [field]: value,
    });
  };

  previewUpload = async (uploadId: string) => {
    this._assertPreviewContextReady(uploadId);

    await this.previewRunner.execute(async () => {
      const preview = await this._api.previewUpload({
        uploadId,
        mapping: this.mapping.get(),
      });

      this.preview.set(preview);
      this.importResult.set(null);
      this.message.set("Preview ready. Verify rows and totals before import.");
    });
  };

  importUpload = async (input: { uploadId: string; skipDuplicates: boolean }) => {
    this._assertPreviewContextReady(input.uploadId);

    await this.importRunner.execute(async () => {
      const importResult = await this._api.importUpload({
        uploadId: input.uploadId,
        mapping: this.mapping.get(),
        skipDuplicates: input.skipDuplicates,
      });

      this.importResult.set(importResult);
      this.message.set("Import complete.");
    });
  };

  private _assertPreviewContextReady = (uploadId: string) => {
    if (this.contextUploadId.get() !== uploadId) {
      throw new AppError("Upload preview context is unavailable. Re-upload this CSV to run mapping preview.");
    }

    if (!this._isMappingReady(this.mapping.get())) {
      throw new AppError("Mapping requires date, description, and amount or debit/credit columns.");
    }
  };

  private _isMappingReady = (mapping: ColumnMapping) => {
    if (!mapping.dateColumn || !mapping.descriptionColumn) {
      return false;
    }

    if (mapping.amountColumn) {
      return true;
    }

    return Boolean(mapping.debitColumn && mapping.creditColumn);
  };

  private _guessMappingFromHeaders = (headers: string[]): Partial<ColumnMapping> => {
    const findHeader = (patterns: string[]) => {
      return (
        headers.find((header) => {
          const normalized = header.toLowerCase();

          return patterns.some((pattern) => normalized.includes(pattern));
        }) ?? ""
      );
    };

    return {
      dateColumn: findHeader(["date"]),
      descriptionColumn: findHeader(["description", "memo", "merchant"]),
      amountColumn: findHeader(["amount"]),
      debitColumn: findHeader(["debit", "withdrawal"]),
      creditColumn: findHeader(["credit", "deposit"]),
    };
  };

  dispose = () => {
    this.contextUploadId.dispose();
    this.headers.dispose();
    this.sampleRows.dispose();
    this.mapping.dispose();
    this.preview.dispose();
    this.importResult.dispose();
    this.message.dispose();
    this.previewRunner.dispose();
    this.importRunner.dispose();
  };
}
