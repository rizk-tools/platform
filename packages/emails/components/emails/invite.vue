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

interface InviteProps {
  email: string
  invitedByUsername: string
  invitedByEmail: string
  teamName: string
  inviteLink: string
}

defineProps<InviteProps>()
</script>

<template>
  <Tailwind>
  <Html lang="en">
    <Head>
      <title>Invitation to join {{ teamName }}</title>
    </Head>
    <Preview>You've been invited to join {{ teamName }} on Rizk</Preview>
    <Container class="bg-white font-sans">
      <Section class="bg-white px-6 py-8 rounded shadow-sm">
        <Heading class="text-xl text-gray-800 font-semibold mb-4">Join {{ teamName }} on Rizk</Heading>
        
        <Text class="text-gray-600 mb-4">
          Hello {{ email }},
        </Text>
        
        <Text class="text-gray-600 mb-4">
          {{ invitedByUsername }} ({{ invitedByEmail }}) has invited you to join their team <strong>{{ teamName }}</strong> on Rizk, the compliance layer for enterprise AI.
        </Text>
        
        <Section class="my-6">
          <Button
            href="{{ inviteLink }}"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md transition-colors"
          >
            Accept Invitation
          </Button>
        </Section>
        
        <Text class="text-gray-600 text-sm mb-4">
          If you're having trouble with the button above, copy and paste the URL below into your web browser:
        </Text>
        
        <Text class="text-xs text-blue-600 break-all mb-4">
          {{ inviteLink }}
        </Text>
        
        <Hr class="my-6 border-gray-200" />
        
        <Text class="text-gray-500 text-xs">
          This invitation was sent to {{ email }}. If you were not expecting this invitation, you can ignore this email.
        </Text>
      </Section>
    </Container>
  </Html>
  </Tailwind>
</template>