import { useEffect, useMemo } from "react";
import { createAccountsApiAdapter } from "../../accounts/adapter/accounts-api-adapter";
import { createCsvImportApiAdapter } from "../adapter/csv-import-api-adapter";
import { CsvImportDomain } from "../domain/csv-import-domain";
import { CsvImportPresenter } from "../presenter/csv-import-presenter";
import { CsvImportScreen } from "./components/csv-import-screen";

const resolveApiBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL;

  if (typeof envValue === "string" && envValue.trim()) {
    return envValue;
  }

  return "http://127.0.0.1:4000";
};

export const CsvImportWrapper = () => {
  const runtime = useMemo(() => {
    const apiBaseUrl = resolveApiBaseUrl();

    const accountsApi = createAccountsApiAdapter({
      apiBaseUrl,
    });

    const csvImportApi = createCsvImportApiAdapter({
      apiBaseUrl,
    });

    const domain = new CsvImportDomain({
      accountsApi,
      csvImportApi,
    });

    const presenter = new CsvImportPresenter(domain);

    return {
      presenter,
      domain,
      dispose: () => {
        presenter.dispose();
        domain.dispose();
      },
    };
  }, []);

  useEffect(() => {
    void runtime.presenter.initialize();

    return () => {
      runtime.dispose();
    };
  }, [runtime]);

  return <CsvImportScreen presenter={runtime.presenter} />;
};
