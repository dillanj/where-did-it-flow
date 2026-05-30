import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createAppApiAdapter } from "./adapter/app-api-adapter";
import { CsvImportWrapper } from "./csv-import/view/wrapper";
import { AppDomain } from "./domain/app-domain";

const resolveApiBaseUrl = () => {
  const envValue = import.meta.env.VITE_API_BASE_URL;

  if (typeof envValue === "string" && envValue.trim()) {
    return envValue;
  }

  return "http://127.0.0.1:4000";
};
const createApp = () => {
  console.log("dillan - creating app domain!");

  const api = createAppApiAdapter({
    apiBaseUrl: resolveApiBaseUrl(),
  });

  return new AppDomain({
    api,
  });
};

export const App = () => {
  const disposeTimeoutIdRef = useRef<number | null>(null);

  const [appDomain, setAppDomain] = useState(() => {
    const app = createApp();
    return app;
  });

  useLayoutEffect(() => {
    return () => {
      console.log("dillan - disposing app domain!");
      appDomain.dispose();
    };
    // if (disposeTimeoutIdRef.current !== null) {
    //   window.clearTimeout(disposeTimeoutIdRef.current)
    //   disposeTimeoutIdRef.current = null
    // }

    // return () => {
    //   disposeTimeoutIdRef.current = window.setTimeout(() => {
    //     appDomain.dispose()
    //     disposeTimeoutIdRef.current = null
    //   }, 0)
    // }
  }, []);

  return <CsvImportWrapper appDomain={appDomain} />;
};
