"use client";
import {
  Alert,
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Input,
  Paper,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { GithubIcon } from "@/components/icons/github";
import { GoogleIcon } from "@/components/icons/google";
import { AuthErrorMessages, AuthErrors } from "@/utils/auth-errors";

export default function AuthenticationForm({ registrationCodeRequired }: { registrationCodeRequired: boolean }) {
  const [type, toggle] = useToggle(["login", "register"]);
  const [authLoading, setAuthLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: false,
      registrationCode: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
      registrationCode: (val) =>
        registrationCodeRequired && !val && type == "register" ? "Registration code is required" : null,
      terms: (val) => (!val && type == "register" ? "You need to accept terms and conditions" : null),
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, callbackUrl] = [searchParams.get("error"), searchParams.get("callbackUrl") || "/"];

  return (
    <main>
      <Center h="100vh">
        <Paper radius="md" p="xl" withBorder>
          <Text size="xl" fw={500}>
            Welcome to pm2.web, {type} with
          </Text>

          {type !== "register" && (
            <>
              <Group grow mb="md" mt="md">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                  <Button leftSection={<GoogleIcon />} variant="default" color="gray" radius="xl">
                    Google
                  </Button>
                )}
                {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
                  <Tooltip label="Registered user account is required to login with Github" position="top">
                    <Button
                      leftSection={<GithubIcon />}
                      variant="default"
                      color="gray"
                      radius="xl"
                      onClick={() =>
                        signIn("github", {
                          callbackUrl: (callbackUrl as string) || "/",
                        })
                      }
                    >
                      Github
                    </Button>
                  </Tooltip>
                )}
              </Group>

              <Divider
                label="Or continue with email"
                labelPosition="center"
                my="lg"
                hidden={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}
              />
            </>
          )}

          <form
            onSubmit={form.onSubmit(async (values) => {
              setAuthLoading(true);
              const res = await signIn("credentials", {
                ...values,
                type: type,
                redirect: false,
              });
              const signInErrored = res?.error != "null";
              router.replace(signInErrored ? `/login?error=${res?.code}` : callbackUrl);
              setAuthLoading(false);
            })}
          >
            <Stack>
              <Transition transition="fade" duration={300} mounted={!!error}>
                {(styles) => (
                  <div style={styles}>
                    {error && (
                      <Alert color="red">{AuthErrorMessages[error as AuthErrors] || AuthErrorMessages.Default}</Alert>
                    )}
                  </div>
                )}
              </Transition>
              {type === "register" && (
                <TextInput
                  name="name"
                  label="Name"
                  placeholder="Your name"
                  {...form.getInputProps("name")}
                  radius="md"
                />
              )}

              <TextInput
                required
                name="email"
                label="Email"
                placeholder="mail@example.com"
                {...form.getInputProps("email")}
                radius="md"
              />
              <PasswordInput
                required
                name="password"
                label="Password"
                placeholder="Your password"
                {...form.getInputProps("password")}
                radius="md"
              />

              {type === "register" && (
                <>
                  {registrationCodeRequired && (
                    <Input.Wrapper label="Registration code" required>
                      <PinInput
                        name="registrationCode"
                        {...form.getInputProps("registrationCode")}
                        radius="md"
                        length={6}
                        mt="0.2rem"
                      />
                    </Input.Wrapper>
                  )}
                  <Checkbox
                    label="I accept terms and conditions"
                    required
                    {...form.getInputProps("terms", {
                      type: "checkbox",
                    })}
                  />
                </>
              )}
            </Stack>

            <Group justify="space-between" mt="xl">
              <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                {type === "register" ? "Already have an account? Login" : "Don't have an account? Register"}
              </Anchor>
              <Button type="submit" radius="xl" loading={authLoading}>
                {upperFirst(type)}
              </Button>
            </Group>
          </form>
        </Paper>
      </Center>
    </main>
  );
}