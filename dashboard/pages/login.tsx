import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken, signIn } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { GithubIcon } from '@/components/icons/github';
import { GoogleIcon } from '@/components/icons/google';
import { fetchSettings } from '@/utils/fetchSSRProps';
import { Alert, Anchor, Button, Center, Checkbox, Divider, Group, Input, Paper, PasswordInput, PinInput, Stack, Text, TextInput, Tooltip, Transition } from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
import { useState } from 'react';

export default function AuthenticationForm({ csrfToken, registrationCodeRequired }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [type, toggle] = useToggle(['login', 'register']);
  const [authLoading, setAuthLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: false,
      registrationCode: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
      registrationCode: (val) => (registrationCodeRequired && !val && type == 'register' ? 'Registration code is required' : null),
      terms: (val) => (!val && type == 'register' ? 'You need to accept terms and conditions' : null),
    },
  });
  const router = useRouter();
  const { error, callbackUrl } = router.query;

  return (
    <>
      <Head>
        <title>pm2.web</title>
        <meta name="description" content="pm2.web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Center h="100vh">
          <Paper radius="md" p="xl" withBorder>
            <Text size="xl" fw={500}>
              Welcome to pm2.web, {type} with
            </Text>

            {type !== 'register' && (
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
                          signIn('github', {
                            callbackUrl: (callbackUrl as string) || '/',
                          })
                        }
                      >
                        Github
                      </Button>
                    </Tooltip>
                  )}
                </Group>

                <Divider label="Or continue with email" labelPosition="center" my="lg" hidden={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID} />
              </>
            )}

            <form
              onSubmit={form.onSubmit(async (values) => {
                setAuthLoading(true);
                const res = await signIn('credentials', { ...values, type: type, redirect: false });
                router.replace(!res?.ok ? `/login?error=${res?.error}` : (callbackUrl as string) || '/');
                setAuthLoading(false);
              })}
            >
              <Stack>
                <Transition transition="fade" duration={300} mounted={!!error}>
                  {(styles) => (
                    <div style={styles}>
                      <SignInError error={error as string} />
                    </div>
                  )}
                </Transition>
                <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                {type === 'register' && <TextInput name="name" label="Name" placeholder="Your name" {...form.getInputProps('name')} radius="md" />}

                <TextInput required name="email" label="Email" placeholder="mail@example.com" {...form.getInputProps('email')} radius="md" />
                <PasswordInput required name="password" label="Password" placeholder="Your password" {...form.getInputProps('password')} radius="md" />

                {type === 'register' && (
                  <>
                    {registrationCodeRequired && (
                      <Input.Wrapper label="Registration code" required>
                        <PinInput name="registrationCode" {...form.getInputProps('registrationCode')} radius="md" length={6} mt="0.2rem" />
                      </Input.Wrapper>
                    )}
                    <Checkbox
                      label="I accept terms and conditions"
                      required
                      {...form.getInputProps('terms', {
                        type: 'checkbox',
                      })}
                    />
                  </>
                )}
              </Stack>

              <Group justify="space-between" mt="xl">
                <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                  {type === 'register' ? 'Already have an account? Login' : "Don't have an account? Register"}
                </Anchor>
                <Button type="submit" radius="xl" loading={authLoading}>
                  {upperFirst(type)}
                </Button>
              </Group>
            </form>
          </Paper>
        </Center>
      </main>
    </>
  );
}

const errors = {
  Signin: 'Unable to sign in with this account. Please try signing in with a different account.',
  OAuthSignin: 'Unable to sign in with this account. Please try signing in with a different account.',
  OAuthCallback: 'Unable to sign in with this account. Please try signing in with a different account.',
  OAuthLinked: 'Account is linked to an Authentication Provider. Please sign in with the same Authentication Provider.',
  OAuthCreateAccount: 'Unable to create an account with this provider. Please try signing in with a different account.',
  EmailCreateAccount: 'Unable to create an account with this email address. Please try using a different email address.',
  Callback: 'Unable to sign in with this account. Please try signing in with a different account.',
  OAuthAccountNotLinked: 'Unable to confirm your identity. Please sign in with the same account you used originally.',
  EmailSignin: 'Unable to sign in with this email address. Please check that your email address is correct.',
  CredentialsSignin: 'Unable to sign in with these credentials. Please check that your details are correct.',
  NotRegistered: 'You need to register an account to continue.',
  AccountExists: 'An account with the same email address already exists. Please sign in instead.',
  IncorrectPassword: 'The password you entered is incorrect. Please try again.',
  default: 'Unable to sign in.',
  Unauthorized: 'No server/process permission found. Please contact the administrator.',
  UnauthorizedRegister: 'Registration successful, no server/process permission found. Please contact the administrator.',
  InvalidForm: 'Some fields are invalid. Please check the form.',
  InvalidRegistrationCode: 'Invalid registration code.',
};

const SignInError = ({ error }: { error: String }) => {
  const errorMessage = error && (errors[error as keyof typeof errors] ?? errors.default);
  return (
    <Alert color="red" maw={'300px'}>
      {errorMessage}
    </Alert>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken, registrationCodeRequired: !!(await fetchSettings()).registrationCode },
  };
}
