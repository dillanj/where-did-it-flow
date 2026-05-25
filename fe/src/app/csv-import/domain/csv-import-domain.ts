import { AppError } from "../../shared/errors/app-error";
import { AccountsDomain } from "../../accounts/domain/accounts-domain";
import type { AccountsApiPort } from "../../accounts/domain/domain-ports";
import type { AccountType } from "../../accounts/domain/domain-model";
import type { ColumnMapping } from "./domain-model";
import type { CsvImportApiPort } from "./domain-ports";
import { MappingPreviewDomain } from "./mapping-preview-domain";
import { UploadsDomain } from "./uploads-domain";

export class CsvImportDomain {
  readonly accountsDomain: AccountsDomain;
  readonly uploadsDomain: UploadsDomain;
  readonly mappingPreviewDomain: MappingPreviewDomain;

  constructor(input: { accountsApi: AccountsApiPort; csvImportApi: CsvImportApiPort }) {
    this.accountsDomain = new AccountsDomain({
      api: input.accountsApi,
    });

    this.uploadsDomain = new UploadsDomain({
      api: input.csvImportApi,
    });

    this.mappingPreviewDomain = new MappingPreviewDomain({
      api: input.csvImportApi,
    });
  }

  initialize = async () => {
    await this.accountsDomain.initialize();
    await this.uploadsDomain.loadByAccountId(this.accountsDomain.getSelectedAccountId());
  };

  createAccount = async (input: { name: string; type: AccountType }) => {
    await this.accountsDomain.createAccount(input);
    await this.uploadsDomain.loadByAccountId(this.accountsDomain.getSelectedAccountId());
    this.mappingPreviewDomain.clearForSelectedAccountChange();
  };

  selectAccount = async (accountId: string) => {
    this.accountsDomain.selectAccount(accountId);
    await this.uploadsDomain.loadByAccountId(accountId);
    this.mappingPreviewDomain.clearForSelectedAccountChange();
  };

  selectUpload = async (uploadId: string) => {
    const previousUploadId = this.uploadsDomain.getSelectedUploadId();

    await this.uploadsDomain.selectUpload(uploadId);

    if (previousUploadId !== uploadId) {
      this.mappingPreviewDomain.clearForSelectedUploadChange();
    }
  };

  uploadCsv = async (file: File) => {
    const selectedAccountId = this.accountsDomain.getSelectedAccountId();

    if (!selectedAccountId) {
      throw new AppError("Select an account before uploading a CSV file.");
    }

    const upload = await this.uploadsDomain.uploadCsv({
      accountId: selectedAccountId,
      file,
    });

    this.mappingPreviewDomain.setUploadContext(upload);
  };

  updateMapping = (field: keyof ColumnMapping, value: string) => {
    this.mappingPreviewDomain.updateMapping(field, value);
  };

  previewSelectedUpload = async () => {
    const selectedUploadId = this.uploadsDomain.getSelectedUploadId();

    if (!selectedUploadId) {
      throw new AppError("Select an upload before running preview.");
    }

    await this.mappingPreviewDomain.previewUpload(selectedUploadId);
  };

  importSelectedUpload = async () => {
    const selectedUploadId = this.uploadsDomain.getSelectedUploadId();
    const selectedAccountId = this.accountsDomain.getSelectedAccountId();

    if (!selectedUploadId) {
      throw new AppError("Select an upload before importing.");
    }

    await this.mappingPreviewDomain.importUpload({
      uploadId: selectedUploadId,
      skipDuplicates: true,
    });

    await this.uploadsDomain.loadByAccountId(selectedAccountId);
  };

  dispose = () => {
    this.accountsDomain.dispose();
    this.uploadsDomain.dispose();
    this.mappingPreviewDomain.dispose();
  };
}
