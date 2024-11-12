import { api,HydrateClient } from "@/trpc/server";

import AuthenticationForm from "./_components/AuthenticationForm";

export default async function LoginPage() {
  const registrationCodeRequired = await api.setting.registrationCodeRequired();

  return (
    <HydrateClient>
      <AuthenticationForm registrationCodeRequired={registrationCodeRequired} />
    </HydrateClient>
  );
}
