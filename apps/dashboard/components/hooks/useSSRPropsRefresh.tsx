import { useRouter } from "next/router";
import { useEffect } from "react";

const useRefreshSSRProps = (refetchInterval: number) => {
  const router = useRouter();
  useEffect(() => {
    const interval = setInterval(
      async () => {
        router.replace(router.asPath);
      },
      Math.min(refetchInterval, 10000),
    );

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useRefreshSSRProps;
