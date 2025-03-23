<script setup lang="ts">
import {
  Tailwind,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@vue-email/components'

interface WelcomeProps {
  email: string
  name?: string
  url: string
  token: string
}

defineProps<WelcomeProps>()
</script>

<template>
  <Tailwind>
  <Html lang="en">
    <Head>
      <title>Verify your email for Rizk</title>
    </Head>
    <Preview>Please verify your email address for Rizk</Preview>
    <Container class="bg-white font-sans">
      <Section class="bg-white px-6 py-8 rounded shadow-sm">
        <Heading class="text-xl text-gray-800 font-semibold mb-4">Verify your email</Heading>
        
        <Text class="text-gray-600 mb-4">
          Hello {{ name }},
        </Text>
        
        <Text class="text-gray-600 mb-4">
          Thank you for signing up for Rizk, the compliance layer for enterprise AI. Please verify your email address to complete your registration.
        </Text>
        
        <Section class="my-6">
          <Button
            href="{{ url }}"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md transition-colors"
          >
            Verify Email Address
          </Button>
        </Section>
        
        <Text class="text-gray-600 text-sm mb-4">
          If you're having trouble with the button above, copy and paste the URL below into your web browser:
        </Text>
        
        <Text class="text-xs text-blue-600 break-all mb-4">
          {{ url }}
        </Text>
        
        <Text class="text-gray-600 mb-4">
          Or use this verification code:
        </Text>
        
        <Text class="text-lg font-mono text-center bg-gray-100 p-3 rounded mb-4">
          {{ token }}
        </Text>
        
        <Hr class="my-6 border-gray-200" />
        
        <Text class="text-gray-500 text-xs">
          This email was sent to {{ email }}. If you did not create an account with Rizk, please ignore this email.
        </Text>
      </Section>
    </Container>
  </Html>
  </Tailwind>
</template> 