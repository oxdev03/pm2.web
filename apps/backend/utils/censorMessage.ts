export default function censorMessage(message: string): string {
  // replace name for privacy
  message = message.replaceAll(
    /c:\\users\\[\da-z]+/gi,
    String.raw`C:\Users\Name`,
  );
  // discord token
  message = message.replaceAll(
    /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g,
    "discord-token",
  );
  return message;
}
