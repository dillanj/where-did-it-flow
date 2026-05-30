import { describe, expect, it } from "vitest";
import { AccountsDomain } from "../../../accounts/domain/accounts-domain";
import type { AccountsApiPort } from "../../../accounts/domain/domain-ports";
import type { Account } from "../../../accounts/domain/domain-model";
import { CsvImportDomain } from "../csv-import-domain";
import type { CsvImportApiPort } from "../domain-ports";
import { MappingPreviewDomain } from "../mapping-preview-domain";
import { UploadsDomain } from "../uploads-domain";

const createApis = (): {
  accountsApi: AccountsApiPort;
  csvImportApi: CsvImportApiPort;
  getListAccountsCallCount: () => number;
} => {
  const accounts: Account[] = [
    {
      id: "acct-1",
      name: "Main",
      type: "checking",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  let listAccountsCallCount = 0;

  const accountsApi: AccountsApiPort = {
    listAccounts: async () => {
      listAccountsCallCount += 1;
      return [...accounts];
    },
    createAccount: async ({ name, type }) => {
      const nextAccount: Account = {
        id: `acct-${accounts.length + 1}`,
        name,
        type,
        createdAt: `2026-01-${String(accounts.length + 1).padStart(2, "0")}T00:00:00.000Z`,
        updatedAt: `2026-01-${String(accounts.length + 1).padStart(2, "0")}T00:00:00.000Z`,
      };

      accounts.push(nextAccount);

      return nextAccount;
    },
  };

  const csvImportApi: CsvImportApiPort = {
    uploadCsv: async () => {
      return {
        id: "upload-1",
        accountId: "acct-1",
        fileName: "test.csv",
        status: "uploaded",
        headers: ["Date", "Description", "Amount"],
        sampleRows: [],
        createdAt: "2026-01-01T00:00:00.000Z",
      };
    },
    listUploadsByAccountId: async () => [],
    getUploadById: async (uploadId) => {
      return {
        id: uploadId,
        accountId: "acct-1",
        fileName: "test.csv",
        status: "uploaded",
        createdAt: "2026-01-01T00:00:00.000Z",
        statementYear: null,
        statementMonth: null,
      };
    },
    previewUpload: async () => {
      return {
        uploadId: "upload-1",
        parsedRowCount: 0,
        invalidRowCount: 0,
        duplicateRowCount: 0,
        inflowTotalCents: 0,
        outflowTotalCents: 0,
        appliedCategoryCount: 0,
        unmappedTransactionCount: 0,
        rows: [],
      };
    },
    importUpload: async () => {
      return {
        uploadId: "upload-1",
        insertedCount: 0,
        skippedDuplicateCount: 0,
        invalidRowCount: 0,
      };
    },
  };

  return {
    accountsApi,
    csvImportApi,
    getListAccountsCallCount: () => listAccountsCallCount,
  };
};

const createDomain = (input: {
  accountsApi: AccountsApiPort;
  csvImportApi: CsvImportApiPort;
}) => {
  return new CsvImportDomain({
    accountsDomain: new AccountsDomain({
      api: input.accountsApi,
    }),
    uploadsDomain: new UploadsDomain({
      api: input.csvImportApi,
    }),
    mappingPreviewDomain: new MappingPreviewDomain({
      api: input.csvImportApi,
    }),
  });
};

describe("CsvImportDomain", () => {
  it("loads accounts and selects first account on initialize", async () => {
    const apiHarness = createApis();
    const domain = createDomain({
      accountsApi: apiHarness.accountsApi,
      csvImportApi: apiHarness.csvImportApi,
    });

    await domain.initialize();

    expect(domain.accountsDomain.accountsBroadcast.get()).toHaveLength(1);
    expect(domain.accountsDomain.selectedAccountId.get()).toBe("acct-1");

    domain.dispose();
  });

  it("reloads accounts and keeps newly created account selected", async () => {
    const apiHarness = createApis();
    const domain = createDomain({
      accountsApi: apiHarness.accountsApi,
      csvImportApi: apiHarness.csvImportApi,
    });

    await domain.initialize();
    await domain.createAccount({
      name: "Travel Card",
      type: "credit_card",
    });

    const accounts = domain.accountsDomain.accountsBroadcast.get();

    expect(domain.accountsDomain.accountsBroadcast.get()).toHaveLength(2);
    expect(accounts.some((account) => account.name === "Travel Card")).toBe(true);
    expect(domain.accountsDomain.selectedAccountId.get()).toBe("acct-2");
    expect(apiHarness.getListAccountsCallCount()).toBe(2);

    domain.dispose();
  });

  it("autofills mapping guesses from upload headers", async () => {
    const apiHarness = createApis();
    const domain = createDomain({
      accountsApi: apiHarness.accountsApi,
      csvImportApi: apiHarness.csvImportApi,
    });

    await domain.initialize();

    const file = new File(["Date,Description,Amount"], "test.csv", {
      type: "text/csv",
    });

    await domain.uploadCsv(file);

    expect(domain.mappingPreviewDomain.mapping.get().dateColumn).toBe("Date");
    expect(domain.mappingPreviewDomain.mapping.get().descriptionColumn).toBe("Description");
    expect(domain.mappingPreviewDomain.mapping.get().amountColumn).toBe("Amount");
    expect(domain.mappingPreviewDomain.contextUploadId.get()).toBe("upload-1");

    domain.dispose();
  });
});
