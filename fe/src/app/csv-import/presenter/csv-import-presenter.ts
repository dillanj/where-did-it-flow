import { derive, type DerivedSignal } from "@tcn/state";
import { AccountsPresenter } from "../../accounts/presenter/accounts-presenter";
import type { AccountType } from "../../accounts/domain/domain-model";
import type { ColumnMapping } from "../domain/domain-model";
import type { CsvImportDomain } from "../domain/csv-import-domain";
import { CsvImportMappingPreviewPresenter } from "./csv-import-mapping-preview-presenter";
import { CsvImportUploadsPresenter } from "./csv-import-uploads-presenter";

export class CsvImportPresenter {
  private readonly _domain: CsvImportDomain;

  readonly accountsPresenter: AccountsPresenter;
  readonly uploadsPresenter: CsvImportUploadsPresenter;
  readonly mappingPreviewPresenter: CsvImportMappingPreviewPresenter;

  private readonly _message: DerivedSignal<string | null>;
  private readonly _errorMessage: DerivedSignal<string | null>;
  private readonly _isInitializing: DerivedSignal<boolean>;

  constructor(domain: CsvImportDomain) {
    this._domain = domain;

    this.accountsPresenter = new AccountsPresenter({
      domain: this._domain.accountsDomain,
    });

    this.uploadsPresenter = new CsvImportUploadsPresenter({
      domain: this._domain.uploadsDomain,
    });

    this.mappingPreviewPresenter = new CsvImportMappingPreviewPresenter({
      domain: this._domain.mappingPreviewDomain,
    });

    this._message = derive(
      this.accountsPresenter.broadcasts.message,
      this.uploadsPresenter.broadcasts.message,
      this.mappingPreviewPresenter.broadcasts.message,
      (accountsMessage, uploadsMessage, mappingPreviewMessage) => {
        return mappingPreviewMessage ?? uploadsMessage ?? accountsMessage ?? null;
      },
    );

    this._errorMessage = derive(
      this.accountsPresenter.broadcasts.errorMessage,
      this.uploadsPresenter.broadcasts.errorMessage,
      this.mappingPreviewPresenter.broadcasts.errorMessage,
      (accountsErrorMessage, uploadsErrorMessage, mappingPreviewErrorMessage) => {
        return mappingPreviewErrorMessage ?? uploadsErrorMessage ?? accountsErrorMessage ?? null;
      },
    );

    this._isInitializing = derive(
      this.accountsPresenter.broadcasts.isInitializing,
      this.uploadsPresenter.broadcasts.isLoadingUploads,
      (isAccountsInitializing, isUploadsInitializing) => {
        return isAccountsInitializing || isUploadsInitializing;
      },
    );
  }

  get broadcasts() {
    return {
      accounts: this.accountsPresenter.broadcasts.accounts,
      selectedAccountId: this.accountsPresenter.broadcasts.selectedAccountId,
      uploads: this.uploadsPresenter.broadcasts.uploads,
      selectedUploadId: this.uploadsPresenter.broadcasts.selectedUploadId,
      selectedUploadDetails: this.uploadsPresenter.broadcasts.selectedUploadDetails,
      headers: this.mappingPreviewPresenter.broadcasts.headers,
      sampleRows: this.mappingPreviewPresenter.broadcasts.sampleRows,
      mapping: this.mappingPreviewPresenter.broadcasts.mapping,
      preview: this.mappingPreviewPresenter.broadcasts.preview,
      importResult: this.mappingPreviewPresenter.broadcasts.importResult,
      message: this._message.broadcast,
      errorMessage: this._errorMessage.broadcast,
      isInitializing: this._isInitializing.broadcast,
      isManagingAccount: this.accountsPresenter.broadcasts.isManagingAccount,
      isUploading: this.uploadsPresenter.broadcasts.isUploading,
      isPreviewing: this.mappingPreviewPresenter.broadcasts.isPreviewing,
      isImporting: this.mappingPreviewPresenter.broadcasts.isImporting,
    };
  }

  initialize = async () => {
    try {
      await this._domain.initialize();
    } catch {
      return;
    }
  };

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this._domain.createAccount(input);
  };

  selectAccount = async (accountId: string) => {
    try {
      await this._domain.selectAccount(accountId);
    } catch {
      return;
    }
  };

  selectUpload = async (uploadId: string) => {
    try {
      await this._domain.selectUpload(uploadId);
    } catch {
      return;
    }
  };

  uploadCsv = async (file: File) => {
    try {
      await this._domain.uploadCsv(file);
    } catch {
      return;
    }
  };

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this._domain.updateMapping(field, value);
  };

  previewSelectedUpload = async () => {
    try {
      await this._domain.previewSelectedUpload();
    } catch {
      return;
    }
  };

  importSelectedUpload = async () => {
    try {
      await this._domain.importSelectedUpload();
    } catch {
      return;
    }
  };

  dispose = () => {
    this._message.dispose();
    this._errorMessage.dispose();
    this._isInitializing.dispose();
    this.mappingPreviewPresenter.dispose();
    this.uploadsPresenter.dispose();
    this.accountsPresenter.dispose();
  };
}
