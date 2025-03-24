export interface WelcomeProps {
  email: string;
  name?: string;
  url: string;
  token: string;
}

export interface InviteProps {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
} 