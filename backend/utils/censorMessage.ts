export default function censorMessage(message: string): string {
  // replace name for privacy
  message = message.replace(/C:\\Users\\[a-zA-Z0-9]+/gi, 'C:\\Users\\Name');
  // discord token
  message = message.replace(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g, 'discord-token');
  return message;
}